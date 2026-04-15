import './globals.css';
// 使用相对路径导入，确保跳过 tsconfig 别名配置可能导致的错误
import { SolanaProvider } from './components/providers/SolanaProvider';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 引入 Google Material Symbols 图标库，供 Sidebar 和 Footer 使用 */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased bg-[#fdfdfd] min-h-screen flex flex-col">
        <SolanaProvider>
          {/* 全局导航栏 */}
          <Navbar />
          
          {/* 页面主体内容：flex-grow 确保内容不满一屏时 Footer 也能触底 */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* 全局页脚 */}
          <Footer />
        </SolanaProvider>
      </body>
    </html>
  );
}