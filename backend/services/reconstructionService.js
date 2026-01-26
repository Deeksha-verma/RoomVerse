const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Service to handle 3D reconstruction via KIRI Engine API
 */
class ReconstructionService {
    constructor() {
        this.apiKey = process.env.PHOTOGRAMMETRY_API_KEY;
        this.baseUrl = "https://api.kiriengine.app/api/v1/open";
    }

    /**
     * Start a reconstruction task on KIRI Engine
     */
    async startReconstruction(files) {
        console.log(`[ReconstructionService] Starting KIRI Task for ${files.length} images...`);

        if (!this.apiKey) {
            throw new Error("KIRI API Key is missing");
        }

        const formData = new FormData();

        // Add images
        files.forEach((file) => {
            formData.append('imagesFiles', fs.createReadStream(file.path));
        });

        // KIRI Parameters
        formData.append('modelQuality', 0); // 0: High
        formData.append('textureQuality', 0); // 0: 4K
        formData.append('isMask', 0); // Turn off masking for rooms
        formData.append('calculateType', 0); // Photo Scan
        formData.append('textureSmoothing', 0);
        formData.append('fileFormat', 'obj');

        try {
            const response = await axios.post(`${this.baseUrl}/photo/image`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: 300000 // 5 minute timeout for large uploads
            });

            console.log("[KIRI API] Full Data:", JSON.stringify(response.data, null, 2));

            const resData = response.data;
            const serialize = resData.data?.serialize || resData.serialize;

            if (serialize) {
                console.log("[KIRI API] Successfully extracted jobId:", serialize);
                return {
                    jobId: serialize,
                    status: 'processing',
                    provider: 'kiri'
                };
            } else if (resData.msg && resData.code !== 200) {
                throw new Error(`KIRI API Error: ${resData.msg} (Code: ${resData.code})`);
            } else {
                throw new Error(`Invalid response from KIRI API. Could not find 'serialize' key. Response: ${JSON.stringify(resData)}`);
            }
        } catch (error) {
            console.error("[KIRI API] Error starting task:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Check status of a KIRI task
     */
    async checkStatus(jobId) {
        if (!this.apiKey) throw new Error("KIRI API Key is missing");

        try {
            const response = await axios.get(`${this.baseUrl}/photo/detail`, {
                params: { serialize: jobId },
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });

            const resultWrapper = response.data;
            const data = resultWrapper.data; // KIRI nested data object

            if (!data) {
                console.warn("[KIRI API] No detail data found in response:", resultWrapper);
                return { status: 'processing', progress: 0 };
            }

            console.log(`[KIRI API] Polling Status for ${jobId}:`, data.status);

            let appStatus = 'processing';
            let modelUrl = null;

            if (data.status === 2) {
                appStatus = 'completed';
                if (data.downloadUrls && data.downloadUrls.obj) {
                    modelUrl = data.downloadUrls.obj;
                } else if (data.modelUrl) {
                    modelUrl = data.modelUrl;
                }
            } else if (data.status === 3) {
                appStatus = 'failed';
            }

            return {
                status: appStatus,
                progress: data.progress || (appStatus === 'completed' ? 100 : 50),
                modelUrl: modelUrl,
                raw: data
            };
        } catch (error) {
            console.error("[KIRI API] Error checking status:", error.response?.data || error.message);
            // Return processing status instead of crashing (KIRI might take a while to have info available)
            return {
                status: 'processing',
                progress: 25,
                error: error.message
            };
        }
    }
}

module.exports = new ReconstructionService();
