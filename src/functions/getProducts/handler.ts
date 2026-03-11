import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

export const main = async (event) => {
  console.log("Evento recebido:", JSON.stringify(event)); 
  
  try {
    const command = new ScanCommand({ 
      TableName: process.env.PRODUCTS_TABLE 
    });
    
    const response = await docClient.send(command);
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: response.Items,
        count: response.Count
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro ao ler o banco", error: error.message }),
    };
  }
};