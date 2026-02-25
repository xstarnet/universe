package uni

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	// 核心组件注册（必须补充，解决 *proxyman.InboundConfig 未注册错误）
	_ "github.com/v2fly/v2ray-core/v5/app/dispatcher"
	_ "github.com/v2fly/v2ray-core/v5/app/proxyman/inbound"
	_ "github.com/v2fly/v2ray-core/v5/app/proxyman/outbound"
	_ "github.com/v2fly/v2ray-core/v5/app/stats"

	// 常用协议注册（根据你的节点配置按需调整：socks 入站 + vmess 出站）
	_ "github.com/v2fly/v2ray-core/v5/proxy/socks"
	_ "github.com/v2fly/v2ray-core/v5/proxy/vmess/outbound"

	// 传输层协议注册（tcp/udp，根据你的节点配置调整）
	_ "github.com/v2fly/v2ray-core/v5/transport/internet/tcp"
	_ "github.com/v2fly/v2ray-core/v5/transport/internet/udp"

	"github.com/urfave/cli/v3"
	core "github.com/v2fly/v2ray-core/v5"
	"github.com/v2fly/v2ray-core/v5/infra/conf/serial"
)

func v2rayCmd() *cli.Command {
	return &cli.Command{
		Name:                   "vr",
		Usage:                  "vr",
		UseShortOptionHandling: true,
		Action: func(ctx context.Context, cmd *cli.Command) error {
			// 1. 编写V2Ray客户端配置（JSON格式，可替换为你的实际节点配置）
			// v2rayConfigJSON := ``

			// 2. 解析V2Ray配置
			// 从文件读取配置，先写死路径
			reader, err := os.Open("./config.json")
			if err != nil {
				fmt.Printf("打开配置文件失败：%v\n", err)
				return err
			}
			defer reader.Close()
			config, err := serial.LoadJSONConfig(reader)
			if err != nil {
				fmt.Printf("解析V2Ray配置失败：%v\n", err)
				return err
			}

			// 4. 启动V2Ray实例
			v2rayInstance, err := core.New(config)
			if err != nil {
				fmt.Printf("启动V2Ray实例失败：%v\n", err)
				return err
			}

			if err := v2rayInstance.Start(); err != nil {
				fmt.Printf("运行V2Ray实例失败：%v\n", err)
				return err
			}
			defer v2rayInstance.Close()

			fmt.Println("V2Ray核心已启动，本地SOCKS5代理端口：10808")

			// 5. 监听退出信号，优雅关闭
			sigChan := make(chan os.Signal, 1)
			signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
			<-sigChan
			fmt.Println("正在关闭V2Ray核心...")

			return nil
		},
	}
}
