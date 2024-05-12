// appwrite.js

import { useSetEndpoint, useProject } from 'appwrite';

// Initialize Appwrite
useSetEndpoint('https://cloud.appwrite.io/v1'); // Replace 'YOUR_ENDPOINT' with your Appwrite endpoint
const { project } = useProject();

// Function to add a document to the database
export const addDocument = async (collectionId, payload) => {
    try {
        const response = await project.createDocument(collectionId, payload);
        console.log('Document added successfully:', response);
        return response; // Return the response if needed
    } catch (error) {
        console.error('Error adding document:', error);
        throw error; // Throw the error to handle it in the component
    }
};
