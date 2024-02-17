from typing import Tuple

import ray
from ray.data import Dataset, Preprocessor
from ray.data.preprocessors import StandardScaler
from ray.train.xgboost import XGBoostTrainer
from ray.train import Result, ScalingConfig
import pandas as pd
from ray.train import Checkpoint
from ray.data import ActorPoolStrategy
import xgboost

def prepare_data() -> Tuple[Dataset, Dataset, Dataset]:
    dataset = ray.data.read_csv("s3://anonymous@air-example-data/breast_cancer.csv")
    train_dataset, valid_dataset = dataset.train_test_split(test_size=0.3)
    test_dataset = valid_dataset.drop_columns(["target"])
    return train_dataset, valid_dataset, test_dataset

def train_xgboost(num_workers: int, use_gpu: bool = False) -> Result:
    train_dataset, valid_dataset, _ = prepare_data()

    # Scale some random columns
    columns_to_scale = ["mean radius", "mean texture"]
    preprocessor = StandardScaler(columns=columns_to_scale)
    train_dataset = preprocessor.fit_transform(train_dataset)
    valid_dataset = preprocessor.transform(valid_dataset)

    # XGBoost specific params
    params = {
        "tree_method": "approx",
        "objective": "binary:logistic",
        "eval_metric": ["logloss", "error"],
    }

    trainer = XGBoostTrainer(
        scaling_config=ScalingConfig(num_workers=num_workers, use_gpu=use_gpu),
        label_column="target",
        params=params,
        datasets={"train": train_dataset, "valid": valid_dataset},
        num_boost_round=100,
        metadata = {"preprocessor_pkl": preprocessor.serialize()}
    )
    result = trainer.fit()
    print(result.metrics)

    return result

class Predict:

    def __init__(self, checkpoint: Checkpoint):
        self.model = XGBoostTrainer.get_model(checkpoint)
        self.preprocessor = Preprocessor.deserialize(checkpoint.get_metadata()["preprocessor_pkl"])

    def __call__(self, batch: pd.DataFrame) -> pd.DataFrame:
        preprocessed_batch = self.preprocessor.transform_batch(batch)
        dmatrix = xgboost.DMatrix(preprocessed_batch)
        return {"predictions": self.model.predict(dmatrix)}


def predict_xgboost(result: Result):
    _, _, test_dataset = prepare_data()

    scores = test_dataset.map_batches(
        Predict, 
        fn_constructor_args=[result.checkpoint], 
        compute=ActorPoolStrategy(), 
        batch_format="pandas"
    )
    
    predicted_labels = scores.map_batches(lambda df: (df > 0.5).astype(int), batch_format="pandas")
    print(f"PREDICTED LABELS")
    predicted_labels.show()

if __name__ == "__main__":
    result = train_xgboost(num_workers=1, use_gpu=False)
    predict_xgboost(result)
