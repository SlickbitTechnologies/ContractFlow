import firebase_admin
from firebase_admin import credentials, firestore
from config import FIREBASE_CREDENTIALS_FILE
from azure.storage.blob import BlobServiceClient, ContentSettings
from config import AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER

# Initialize Firebase app for Firestore if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_FILE)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def save_contract_to_firestore(contract):
    """Save contract details to Firestore 'contracts' collection and return doc ID."""
    doc_ref = db.collection('contracts').add(contract)
    return doc_ref[1].id  # Returns the document ID

def delete_contract_from_firestore(doc_id):
    """Delete contract from Firestore by document ID and remove PDF from Azure if present."""
    # Get the contract to find the PDF URL
    contract_ref = db.collection('contracts').document(doc_id)
    contract = contract_ref.get()
    if contract.exists:
        contract_data = contract.to_dict()
        pdf_url = contract_data.get('pdf_url')
        if pdf_url:
            # Extract blob name from URL
            from urllib.parse import urlparse
            path = urlparse(pdf_url).path
            blob_name = path.split('/')[-1]
            blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
            blob_client = blob_service_client.get_blob_client(container=AZURE_STORAGE_CONTAINER, blob=blob_name)
            try:
                blob_client.delete_blob()
            except Exception:
                pass  # Ignore if blob does not exist
    contract_ref.delete()

def update_contract_in_firestore(doc_id, contract):
    """Update contract in Firestore by document ID."""
    db.collection('contracts').document(doc_id).update(contract)

def load_contracts_from_firestore():
    contracts = []
    docs = db.collection('contracts').stream()
    for doc in docs:
        contract = doc.to_dict()
        contract['firebase_doc_id'] = doc.id  # Include the doc ID for deletion
        contracts.append(contract)
    return contracts

def upload_pdf_to_azure(file_bytes, filename):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    blob_client = blob_service_client.get_blob_client(container=AZURE_STORAGE_CONTAINER, blob=filename)
    blob_client.upload_blob(
        file_bytes,
        overwrite=True,
        content_settings=ContentSettings(
            content_type='application/pdf',
            content_disposition='inline'
        )
    )
    return blob_client.url 