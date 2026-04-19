import {
  isSolanaError,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
} from "@solana/kit";
// 整体导入，避免找不到成员的编译错误
import * as Generated from "../generated/descholarism";

/**
 * 尝试从生成的模块中寻找错误解析函数
 * Codama 可能生成的名称：getDescholarismErrorMessage 或 getDescholarismProgramErrorMessage
 */
const getErrorMessageFn = 
  (Generated as any).getDescholarismErrorMessage || 
  (Generated as any).getDescholarismProgramErrorMessage ||
  ((code: number) => `Unknown Program Error: ${code}`);

export function parseTransactionError(err: unknown): string {
  // 1. 钱包拒绝错误处理
  if (err instanceof Error && err.message.includes("User rejected")) {
    return "交易已被钱包拒绝。";
  }

  // 2. 处理 Solana 自定义程序错误 (Custom Program Error)
  if (
    isSolanaError(err, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM) &&
    typeof err.context?.code === "number"
  ) {
    const code = err.context.code;
    try {
      // 直接调用探测到的解析函数
      return getErrorMessageFn(code);
    } catch (e) {
      return `程序错误 (代码: ${code})`;
    }
  }

  // 3. 兜底逻辑：获取最深层的错误消息
  const message = getDeepestMessage(err);
  return message.length > 200 ? `${message.slice(0, 200)}...` : message;
}

function getDeepestMessage(err: unknown): string {
  let deepest = err instanceof Error ? err.message : String(err);
  let current: unknown = err;

  while (current instanceof Error && current.cause) {
    current = current.cause;
    if (current instanceof Error) {
      deepest = current.message;
    }
  }

  return deepest;
}