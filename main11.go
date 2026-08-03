package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type Prompt struct {
	ID        string            `json:"id"`
	Variables map[string]string `json:"variables,omitempty"`
}

type ResponseRequest struct {
	Prompt Prompt `json:"prompt"`
	Input  string `json:"input"`
}

type ResponseData struct {
	OutputText string `json:"output_text"`
}

func main() {
	apiKey := "AQVN3URzJQka8xSpp0DxNgbXa38dQmrXH5IrRmdt"
	folderID := "b1ghp2t1hbddkurtrt9g"

	reqData := ResponseRequest{
		Prompt: Prompt{
			ID: "fvtj28tkcekgdt6rnm2v",
		},
		Input: "some message",
	}

	jsonData, err := json.Marshal(reqData)
	if err != nil {
		log.Fatal(err)
	}

	req, err := http.NewRequest("POST", "https://ai.api.cloud.yandex.net/v1/responses", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatal(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Api-Key "+apiKey)
	req.Header.Set("OpenAI-Project", folderID)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Response: %s\n", string(body))

	if resp.StatusCode == 200 {
		var response ResponseData
		err = json.Unmarshal(body, &response)
		if err != nil {
			log.Printf("Error parsing response: %v", err)
		} else {
			fmt.Println("Output:", response.OutputText)
		}
	}
}