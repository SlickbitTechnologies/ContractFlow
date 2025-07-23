from fastapi import APIRouter, File, UploadFile, HTTPException
import os
from llm_utils import call_gemini_llm_with_pdf
from storage import save_contract_to_firestore, upload_pdf_to_azure

router = APIRouter()

@router.post("/upload_contract/")
async def upload_contract(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    pdf_bytes = await file.read()
    azure_url = upload_pdf_to_azure(pdf_bytes, file.filename)
    contracts = call_gemini_llm_with_pdf(pdf_bytes)
    saved_contracts = []

    # Handle both single contract and list of contracts from Gemini
    if isinstance(contracts, list):
        for contract in contracts:
            contract['pdf_url'] = azure_url
            doc_id = save_contract_to_firestore(contract)
            saved_contracts.append({**contract, "firebase_doc_id": doc_id})
    else:
        contracts['pdf_url'] = azure_url
        doc_id = save_contract_to_firestore(contracts)
        saved_contracts.append({**contracts, "firebase_doc_id": doc_id})
        
    return {"status": "success", "contracts": saved_contracts} 