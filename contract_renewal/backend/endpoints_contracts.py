from fastapi import APIRouter, HTTPException
from storage import load_contracts_from_firestore, delete_contract_from_firestore, update_contract_in_firestore
from llm_utils import Contract

router = APIRouter()

@router.get("/contracts/")
def get_contracts():
    return load_contracts_from_firestore()

@router.delete("/contracts/{doc_id}")
def delete_contract(doc_id: str):
    try:
        delete_contract_from_firestore(doc_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/contracts/{doc_id}")
def update_contract(doc_id: str, contract: Contract):
    try:
        update_contract_in_firestore(doc_id, contract.dict())
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 