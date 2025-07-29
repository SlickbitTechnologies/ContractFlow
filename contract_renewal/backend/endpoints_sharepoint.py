from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from sharepoint_service import sharepoint_service

router = APIRouter()

@router.get("/sharepoint/sites")
async def get_sharepoint_sites(search_term: str = "Contracts"):
    """Get SharePoint sites matching the search term"""
    try:
        result = sharepoint_service.get_sites(search_term)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch SharePoint sites: {str(e)}")

@router.get("/sharepoint/specific-site/files")
async def get_specific_site_files():
    """Get files from the specific SharePoint site"""
    try:
        result = sharepoint_service.get_specific_site_files()
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch specific site files: {str(e)}")

@router.get("/sharepoint/download/{file_id}")
async def download_sharepoint_file(file_id: str):
    """Download a file from SharePoint using file ID"""
    try:
        result = sharepoint_service.download_file_from_sharepoint(file_id)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return Response(content=result, media_type="application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download SharePoint file: {str(e)}")

@router.get("/sharepoint/status")
async def get_sharepoint_status():
    """Check SharePoint connection status"""
    try:
        token = sharepoint_service.get_access_token()
        if token:
            return {"status": "connected", "message": "SharePoint integration is working"}
        else:
            return {"status": "disconnected", "message": "Failed to get access token"}
    except Exception as e:
        return {"status": "error", "message": f"SharePoint integration error: {str(e)}"} 