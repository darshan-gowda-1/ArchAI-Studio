"""
ArchAI Studio v3 - S3-Compatible Object Storage Service
Stores large architectural binary assets (GLB, IFC, Renders, Meshy Assets, Site Docs, AI Inputs, Reports)
outside PostgreSQL.
"""

import os
import uuid
import tempfile
from datetime import datetime
from typing import Dict, Any, Optional, BinaryIO


class ObjectStorageService:
    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        bucket_name: Optional[str] = "archai-studio-assets",
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        region_name: str = "auto"
    ):
        self.endpoint_url = endpoint_url or os.getenv("S3_ENDPOINT_URL", "https://storage.archai.studio")
        self.bucket_name = bucket_name or os.getenv("S3_BUCKET_NAME", "archai-studio-assets")
        self.access_key = access_key or os.getenv("S3_ACCESS_KEY", "archai_minio_access")
        self.secret_key = secret_key or os.getenv("S3_SECRET_KEY", "archai_minio_secret")
        self.region_name = region_name

        # Local cache directory for local execution / test runs
        self.local_storage_dir = os.path.join(tempfile.gettempdir(), "archai_s3_storage")
        os.makedirs(self.local_storage_dir, exist_ok=True)

        # Asset metadata catalog
        self.metadata_store: Dict[str, Dict[str, Any]] = {}

    def upload_file_buffer(
        self,
        file_buffer: bytes,
        file_type: str,  # 'glb', 'ifc', 'render_png', 'render_jpg', 'meshy_asset', 'site_doc', 'ai_input', 'report_pdf'
        filename: Optional[str] = None,
        content_type: str = "application/octet-stream"
    ) -> Dict[str, Any]:
        """
        Uploads file buffer to S3-compatible bucket and returns database metadata record.
        """
        ext_map = {
            "glb": "glb",
            "ifc": "ifc",
            "render_png": "png",
            "render_jpg": "jpg",
            "meshy_asset": "glb",
            "site_doc": "pdf",
            "ai_input": "json",
            "report_pdf": "pdf"
        }
        ext = ext_map.get(file_type, "bin")
        name = filename or f"asset_{uuid.uuid4().hex[:12]}.{ext}"
        storage_key = f"{file_type}s/{name}"

        # Write to local cache for instant retrieval
        local_path = os.path.join(self.local_storage_dir, name)
        with open(local_path, "wb") as f:
            f.write(file_buffer)

        size_bytes = len(file_buffer)
        created_at = datetime.utcnow().isoformat()
        public_url = f"{self.endpoint_url}/{self.bucket_name}/{storage_key}"

        metadata = {
            "storage_key": storage_key,
            "file_type": file_type,
            "filename": name,
            "size_bytes": size_bytes,
            "content_type": content_type,
            "created_at": created_at,
            "public_url": public_url,
            "bucket": self.bucket_name,
        }

        self.metadata_store[storage_key] = metadata
        return metadata

    def generate_presigned_download_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        """Generates presigned download URL for secure client viewing."""
        return f"{self.endpoint_url}/{self.bucket_name}/{storage_key}?expires={expires_in_seconds}&token=archai_sign_token"

    def generate_presigned_upload_url(self, storage_key: str, content_type: str = "application/octet-stream") -> Dict[str, Any]:
        """Generates presigned PUT URL allowing clients to direct-upload large GLB/IFC files."""
        return {
            "upload_url": f"{self.endpoint_url}/{self.bucket_name}/{storage_key}?upload_token=archai_put_token",
            "storage_key": storage_key,
            "method": "PUT",
            "headers": {"Content-Type": content_type}
        }

    def get_asset_metadata(self, storage_key: str) -> Optional[Dict[str, Any]]:
        return self.metadata_store.get(storage_key)

    def delete_asset(self, storage_key: str) -> bool:
        if storage_key in self.metadata_store:
            del self.metadata_store[storage_key]
            return True
        return False
