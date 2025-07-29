import requests
from config import MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID, SHAREPOINT_SITE_ID


class SharePointService:
    def __init__(self):
        self.access_token = None
        # These values are loaded from environment variables via config.py
        # Set MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID in your .env file
        self.client_id = MICROSOFT_CLIENT_ID
        self.client_secret = MICROSOFT_CLIENT_SECRET
        self.tenant_id = MICROSOFT_TENANT_ID
        self.token_url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"
        self.graph_base_url = "https://graph.microsoft.com/v1.0"
        self.drive_id = None  # Store drive ID for reuse
        self.specific_site_id = SHAREPOINT_SITE_ID

    def get_access_token(self):
        try:
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'grant_type': 'client_credentials',
                'scope': 'https://graph.microsoft.com/.default'
            }

            response = requests.post(self.token_url, data=data)
            response.raise_for_status()

            token_data = response.json()
            self.access_token = token_data.get('access_token')
            return self.access_token

        except requests.exceptions.RequestException as e:
            print(f"Access token error: {e}")
            return None

    def get_headers(self):
        if not self.access_token:
            self.get_access_token()
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

    def get_sites(self, search_term="Contracts"):
        try:
            url = f"{self.graph_base_url}/sites?search={search_term}"
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Site search error: {e}")
            return {"error": str(e)}

    def get_specific_site_info(self):
        try:
            url = f"{self.graph_base_url}/sites/{self.specific_site_id}"
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Site info fetch error: {e}")
            return {"error": str(e)}

    def _fetch_files_recursive(self, parent_url):
        files = []
        try:
            response = requests.get(parent_url, headers=self.get_headers())
            response.raise_for_status()
            data = response.json()
            for item in data.get("value", []):
                if item.get("folder"):
                    # If it's a folder, recursively fetch its children
                    folder_id = item["id"]
                    folder_url = f"{self.graph_base_url}/drives/{self.drive_id}/items/{folder_id}/children"
                    files.extend(self._fetch_files_recursive(folder_url))
                else:
                    files.append(item)
            # Handle pagination (nextLink)
            next_link = data.get("@odata.nextLink")
            if next_link:
                files.extend(self._fetch_files_recursive(next_link))
        except Exception as e:
            print(f"Recursive fetch error: {e}")
        return files

    def get_specific_site_files(self):
        try:
            url = f"{self.graph_base_url}/sites/{self.specific_site_id}/drive/root/children"
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            data = response.json()

            # Cache driveId for download use
            if not self.drive_id and data["value"] and "parentReference" in data["value"][0]:
                self.drive_id = data["value"][0]["parentReference"]["driveId"]

            # Recursively fetch all files from root
            if not self.drive_id:
                raise Exception("Drive ID not available. Cannot fetch files.")
            root_url = f"{self.graph_base_url}/drives/{self.drive_id}/root/children"
            all_files = self._fetch_files_recursive(root_url)
            return {"value": all_files}
        except requests.exceptions.RequestException as e:
            print(f"File fetch error: {e}")
            return {"error": str(e)}
        except Exception as e:
            print(f"File fetch setup error: {e}")
            return {"error": str(e)}

    def get_site_files(self, site_id):
        try:
            url = f"{self.graph_base_url}/sites/{site_id}/drive/root/children"
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Site files error: {e}")
            return {"error": str(e)}

    def download_file_from_sharepoint(self, file_id):
        try:
            if not self.drive_id:
                print("Drive ID not cached. Fetching specific site files to retrieve it.")
                self.get_specific_site_files()  # Populates self.drive_id

            if not self.drive_id:
                raise Exception("Drive ID not available. Cannot download file.")

            url = f"{self.graph_base_url}/drives/{self.drive_id}/items/{file_id}/content"
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            return response.content
        except requests.exceptions.RequestException as e:
            print(f"Download error: {e}")
            return {"error": str(e)}
        except Exception as e:
            print(f"Download setup error: {e}")
            return {"error": str(e)}

    def upload_file_to_sharepoint(self, site_id, file_content, filename):
        try:
            url = f"{self.graph_base_url}/sites/{site_id}/drive/root:/{filename}:/content"
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/octet-stream'
            }
            response = requests.put(url, headers=headers, data=file_content)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Upload error: {e}")
            return {"error": str(e)}

# Global instance
sharepoint_service = SharePointService()
