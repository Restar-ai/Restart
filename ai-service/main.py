import json
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager
from rag import load_knowledge, retrieve

# Must define custom layer BEFORE loading model
class SkillEmbeddingLayer(tf.keras.layers.Layer):
    def __init__(self, embedding_dim=12, **kwargs):
        super().__init__(**kwargs)
        self.embedding_dim = embedding_dim

    def build(self, input_shape):
        self.embedding_matrix = self.add_weight(
            name='embedding_matrix',
            shape=(input_shape[-1], self.embedding_dim),
            initializer='glorot_uniform',
            trainable=True
        )
        self.bias = self.add_weight(
            name='embedding_bias',
            shape=(self.embedding_dim,),
            initializer='zeros',
            trainable=True
        )
        self.layer_norm = tf.keras.layers.LayerNormalization()
        super().build(input_shape)

    def call(self, inputs):
        x = tf.matmul(inputs, self.embedding_matrix)
        x = tf.nn.bias_add(x, self.bias)
        x = self.layer_norm(x)
        return tf.nn.relu(x)

    def get_config(self):
        config = super().get_config()
        config.update({'embedding_dim': self.embedding_dim})
        return config


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML model
    global keras_model, mean_arr, scale_arr, profession_classes
    with open("model/feature_scaler.json") as f:
        scaler = json.load(f)
    with open("model/profession_classes.json") as f:
        profession_classes = json.load(f)
    mean_arr = np.array(scaler["mean"])
    scale_arr = np.array(scaler["scale"])
    keras_model = tf.keras.models.load_model(
        "model/profession_recommendation_model.keras",
        custom_objects={"SkillEmbeddingLayer": SkillEmbeddingLayer}
    )
    print("Keras model loaded.")

    # Load RAG knowledge base
    load_knowledge()

    yield


app = FastAPI(title="RESTART Career AI Service", lifespan=lifespan)

import os
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

keras_model = None
mean_arr = None
scale_arr = None
profession_classes = None


class PredictRequest(BaseModel):
    features: List[float]


class RetrieveRequest(BaseModel):
    query: str
    n_results: int = 4


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": keras_model is not None}


@app.post("/predict")
def predict(request: PredictRequest):
    if len(request.features) != 16:
        raise HTTPException(status_code=400, detail=f"Expected 16 features, got {len(request.features)}")

    raw = np.array(request.features, dtype=np.float32)
    normalized = (raw - mean_arr) / scale_arr
    normalized = normalized.reshape(1, -1)

    logits = keras_model.predict(normalized, verbose=0)
    probabilities = tf.nn.softmax(logits[0]).numpy()

    top3_indices = np.argsort(probabilities)[::-1][:3]
    predictions = [
        {
            "rank": int(i + 1),
            "profession": profession_classes[str(idx)],
            "confidence": float(round(float(probabilities[idx]), 4))
        }
        for i, idx in enumerate(top3_indices)
    ]

    return {"success": True, "predictions": predictions}


@app.post("/retrieve")
def retrieve_context(request: RetrieveRequest):
    docs = retrieve(request.query, request.n_results)
    return {"documents": docs}
