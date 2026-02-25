import { useState, useEffect } from "react";
import { Button, Input } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import { api } from "../api";
import { Capacitor } from "@capacitor/core";
import { Toast } from "antd-mobile";
import { preferences } from "../utils/preferences";

function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();

  const sendSmsCode = async (): Promise<boolean> => {
    try {
      await api.user.SendSmsCode({
        body: {
          phone: phoneNumber,
        },
      });
      Toast.show({ content: "验证码已发送" });
      return true;
    } catch (e: unknown) {
      console.error("[sendSmsCode]", e);
      return false;
    }
  };

  const verifySmsCode = async (): Promise<boolean> => {
    try {
      const res = await api.user.Login({
        body: {
          phone: phoneNumber,
          sms_code: smsCode,
        },
      });
      await preferences.set("token", res.token);
      await preferences.set("refresh_token", res.refresh_token);
      if (typeof res.expires_in === "number") {
        await preferences.set("token_expires_in", String(res.expires_in));
      }
      Toast.show({ content: "登录成功" });
      return true;
    } catch {
      return false;
    }
  };

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      Toast.show({ content: "请输入有效的手机号" });
      return;
    }

    const ok = await sendSmsCode();
    if (ok) {
      setIsVerificationStep(true);
      setResendCountdown(60);
    }
  };

  const handleSubmit = async () => {
    if (!smsCode.trim() || smsCode.length !== 6 || isNaN(Number(smsCode))) {
      Toast.show({ content: "请输入有效的6位短信验证码" });
      return;
    }

    const ok = await verifySmsCode();
    if (ok) {
      navigate("/home", { replace: true });
    }
  };

  const handleEditPhone = () => {
    setIsVerificationStep(false);
    setSmsCode("");
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    const ok = await sendSmsCode();
    if (ok) {
      setResendCountdown(60);
    }
  };

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    preferences.getAsync("token").then((token) => {
      if (token) {
        navigate("/home", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h2
            className="welcome-title"
            onClick={() => {
              if (Capacitor.isNativePlatform()) {
                // todo
              }
            }}
          >
            愿此行，终抵群星
          </h2>
          <div className="login-form">
            <Input
              placeholder="手机号"
              value={phoneNumber}
              onChange={(val) => setPhoneNumber(val)}
              className="phone-input"
              disabled={isVerificationStep}
            />

            {isVerificationStep && (
              <>
                <Input
                  placeholder="短信验证码"
                  value={smsCode}
                  onChange={(val) => {
                    const numericVal = val.replace(/[^0-9]/g, "").slice(0, 6);
                    setSmsCode(numericVal);
                  }}
                  className="phone-input"
                />
                <div className="sms-actions">
                  <button
                    className="text-button"
                    type="button"
                    onClick={handleEditPhone}
                  >
                    重新编辑手机号
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    onClick={handleResend}
                    disabled={resendCountdown > 0}
                  >
                    {resendCountdown > 0
                      ? `重新发送(${resendCountdown}s)`
                      : "重新发送验证码"}
                  </button>
                </div>
              </>
            )}

            {/* 错误提示统一使用 Toast，不再占位 */}

            <Button
              block
              color="primary"
              className="continue-button"
              onClick={isVerificationStep ? handleSubmit : handleContinue}
            >
              {isVerificationStep ? "提交" : "继续"}
            </Button>
          </div>
        </div>

        <div className="footer-section">
          <div className="divider" />
          <p
            className="footer-text"
            onClick={() => {
              if (Capacitor.isNativePlatform()) {
                // todo
              }
            }}
          >
            愿此行，终抵群星
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
