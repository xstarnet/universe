package utils

import (
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type HttpResponse struct {
	Data    interface{} `json:"data"`
	Code    int32       `json:"code"`
	Message *string     `json:"message,omitempty"`
	Detail  *string     `json:"detail,omitempty"`
}

func Fail(c *app.RequestContext, code int32, message string, detail *string) {
	resp := &HttpResponse{
		Data:    nil,
		Code:    code,
		Message: &message,
		Detail:  detail,
	}
	c.JSON(consts.StatusOK, &resp)
}

func InvalidArgs(c *app.RequestContext, err error) {
	Fail(c, 50400, "请求参数无效", V2p(err.Error()))
}

func InternalError(c *app.RequestContext, err error) {
	Fail(c, 50500, "服务器内部错误", V2p(err.Error()))
}

func BizError(c *app.RequestContext, detail string) {
	Fail(c, 50900, "业务错误", V2p(detail))
}

func NotImplemented(c *app.RequestContext) {
	Fail(c, 50500, "功能尚未实现", nil)
}

func NotFound(c *app.RequestContext, detail string) {
	Fail(c, 40400, "资源未找到", V2p(detail))
}

func Unauthorized(c *app.RequestContext, detail string) {
	Fail(c, 40100, "未授权", V2p(detail))
}

func TooManyRequests(c *app.RequestContext, detail string) {
	Fail(c, 42900, "请求过于频繁", V2p(detail))
}

func Success(c *app.RequestContext, data interface{}, detail ...string) {
	resp := &HttpResponse{
		Data: data,
		Code: 20000,
	}
	if len(detail) > 0 {
		resp.Detail = V2p(strings.Join(detail, "\n"))
	}
	c.JSON(consts.StatusOK, resp)
}
