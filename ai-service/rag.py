import json
import os
from sentence_transformers import SentenceTransformer
import chromadb

_model = None
_collection = None

def _get_model():
    global _model
    if _model is None:
        print("Loading embedding model...")
        local_path = os.path.join(os.path.dirname(__file__), "models", "paraphrase-multilingual-MiniLM-L12-v2")
        model_source = local_path if os.path.exists(local_path) else "paraphrase-multilingual-MiniLM-L12-v2"
        _model = SentenceTransformer(model_source)
        print("Embedding model loaded.")
    return _model

def _get_collection():
    global _collection
    if _collection is None:
        client = chromadb.Client()
        _collection = client.get_or_create_collection("restart_knowledge")
    return _collection

def load_knowledge():
    collection = _get_collection()

    if collection.count() > 0:
        print(f"Knowledge base already loaded ({collection.count()} documents).")
        return

    knowledge_path = os.path.join(os.path.dirname(__file__), "knowledge", "professions.json")
    with open(knowledge_path, encoding="utf-8") as f:
        professions = json.load(f)

    model = _get_model()
    documents, ids, metadatas = [], [], []

    for prof in professions:
        # Each profession is split into multiple chunks for better retrieval
        chunks = [
            f"{prof['title']}: {prof['description']}",
            f"{prof['title']} - Tugas: {prof['tasks']}",
            f"{prof['title']} - Skill yang dibutuhkan: {prof['skills_needed']}",
            f"{prof['title']} - Cara memulai karier: {prof['how_to_start']}",
            f"{prof['title']} - Jenjang karier: {prof['career_path']}",
            f"{prof['title']} - Gaji: {prof['salary_range']}. Tipe kepribadian: {prof['riasec']}",
        ]
        for i, chunk in enumerate(chunks):
            doc_id = f"{prof['id']}_chunk_{i}"
            documents.append(chunk)
            ids.append(doc_id)
            metadatas.append({"profession": prof["title"], "chunk_type": i})

    embeddings = model.encode(documents).tolist()
    collection.add(documents=documents, embeddings=embeddings, ids=ids, metadatas=metadatas)
    print(f"Knowledge base loaded: {len(documents)} chunks from {len(professions)} professions.")


def retrieve(query: str, n_results: int = 4) -> list[str]:
    collection = _get_collection()
    model = _get_model()

    query_embedding = model.encode([query]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=n_results)

    return results["documents"][0] if results["documents"] else []
