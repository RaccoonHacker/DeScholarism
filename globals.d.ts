// 强制让 TS 识别所有以 .css 结尾的导入
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}