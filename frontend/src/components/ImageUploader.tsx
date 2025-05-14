import { useState, useRef, type ChangeEvent } from "react"
import { fetchWithCSRF } from "../utils";

function ImageUploader() {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [uploadStatus, setUploadStatus] = useState<{ message: string; isError: boolean }>({
		message: "",
		isError: false,
	})
	const [isUploading, setIsUploading] = useState<boolean>(false)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/gif"]
	const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (!selectedFile) return

		if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
			setUploadStatus({
				message: "Unsupported file format. Please upload a JPEG, PNG, or GIF.",
				isError: true,
			})
			resetFileInput()
			return
		}

		if (selectedFile.size > MAX_FILE_SIZE) {
			setUploadStatus({
				message: "File too large. Maximum size is 5MB.",
				isError: true,
			})
			resetFileInput()
			return
		}

		setImageUrl(URL.createObjectURL(selectedFile))
		setUploadStatus({ message: "", isError: false })
	}

	const handleUpload = async () => {
		const file = fileInputRef.current?.files?.[0]
		if (!file) return

		const formData = new FormData()
		formData.append("image", file)

		try {
			setIsUploading(true)
			setUploadStatus({ message: "Uploading...", isError: false })

			const response = await fetchWithCSRF("http://localhost:8000/database/api/upload/", {
				method: "POST",
				body: formData,
				credentials: "include",
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.message || "Upload failed")
			}

			const data = await response.json()
			setUploadStatus({
				message: `Upload successful! URL: ${data.image_url || data.image_path || "N/A"}`,
				isError: false,
			})

			URL.revokeObjectURL(imageUrl || "")
			resetFileInput()
		} catch (error) {
			setUploadStatus({
				message: `Error: ${error.message}`,
				isError: true,
			})
		} finally {
			setIsUploading(false)
		}
	}

	const resetFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
			setImageUrl(null)
		}
	}

	return (
		<div className="image-uploader">
			<h2>Image Upload</h2>
			<input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} disabled={isUploading} />
			{imageUrl && (
				<div className="preview-section">
					<h3>Preview</h3>
					<img src={imageUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "300px" }} />
					<button onClick={handleUpload} disabled={isUploading}>
						{isUploading ? "Uploading..." : "Upload to Server"}
					</button>
				</div>
			)}
			{uploadStatus.message && (
				<p className={uploadStatus.isError ? "error" : "success"}>{uploadStatus.message}</p>
			)}
		</div>
	)
}

export default ImageUploader
