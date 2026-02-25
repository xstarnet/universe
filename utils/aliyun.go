// This file is auto-generated, don't edit it. Thanks.
package utils

import (
	"encoding/json"
	"fmt"

	openapi "github.com/alibabacloud-go/darabonba-openapi/v2/client"
	dypnsapi20170525 "github.com/alibabacloud-go/dypnsapi-20170525/v3/client"
	util "github.com/alibabacloud-go/tea-utils/v2/service"
	"github.com/alibabacloud-go/tea/tea"
	credential "github.com/aliyun/credentials-go/credentials"
)

// Description:
//
// 使用凭据初始化账号Client
//
// @return Client
//
// @throws Exception
func CreateClient() (_result *dypnsapi20170525.Client, _err error) {
	// 工程代码建议使用更安全的无AK方式，凭据配置方式请参见：https://help.aliyun.com/document_detail/378661.html。
	credential, _err := credential.NewCredential(nil)
	if _err != nil {
		return _result, _err
	}

	config := &openapi.Config{
		Credential: credential,
	}
	// Endpoint 请参考 https://api.aliyun.com/product/Dypnsapi
	config.Endpoint = tea.String("dypnsapi.aliyuncs.com")
	_result = &dypnsapi20170525.Client{}
	_result, _err = dypnsapi20170525.NewClient(config)
	return _result, _err
}

func SendSMSCode(code string, phone string) error {
	client, err := CreateClient()
	if err != nil {
		return fmt.Errorf("failed to create SMS client: %w", err)
	}

	sendSmsVerifyCodeRequest := &dypnsapi20170525.SendSmsVerifyCodeRequest{
		SignName:      tea.String("速通互联验证码"),
		TemplateCode:  tea.String("100001"),
		PhoneNumber:   tea.String(phone),
		TemplateParam: tea.String(fmt.Sprintf("{\"code\":\"%s\",\"min\":\"5\"}", code)),
	}

	runtime := &util.RuntimeOptions{}
	resp, err := client.SendSmsVerifyCodeWithOptions(sendSmsVerifyCodeRequest, runtime)
	if err != nil {
		Logger.Errorf("Failed to send SMS code to %s: %v", phone, err)
		Logger.Errorf("API response: %+v", resp)

		// Extract more detailed error information if available
		if sdkErr, ok := err.(*tea.SDKError); ok {
			Logger.Errorf("SDK Error Details: Message=%s, Code=%s, Data=%s",
				tea.StringValue(sdkErr.Message),
				tea.StringValue(sdkErr.Code),
				tea.StringValue(sdkErr.Data))

			// Try to parse the error data for more details
			var data map[string]interface{}
			if err := json.Unmarshal([]byte(tea.StringValue(sdkErr.Data)), &data); err == nil {
				if recommend, ok := data["Recommend"]; ok {
					Logger.Errorf("SDK Error Recommendation: %v", recommend)
				}
			}

			return fmt.Errorf("SMS service error: %s",
				tea.StringValue(sdkErr.Message))
		}

		return fmt.Errorf("failed to send SMS code: %w", err)
	}

	if resp.GetBody().Code != nil {
		if *resp.GetBody().Code != "OK" {
			return fmt.Errorf("%s", *resp.GetBody().Code)
		}
	}

	return nil
}
