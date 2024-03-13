import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudianry =async (localFilePath) =>{
    try {
        if(!localFilePath) return null;
       const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });

        if(response)
        fs.unlinkSync(localFilePath); //removing file 

        console.log("File uploaded");
        return response;
        
    } catch (error) {
        
        fs.unlinkSync(localFilePath); //removing temp file in failure
        return null;
    }
}

export {uploadOnCloudianry}
