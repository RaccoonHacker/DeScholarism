// 将 @/ 换成 ./
import Hero from './components/home/Hero';
import ResearchList from './components/home/ResearchList';
import Features from './components/home/Features'; // 别忘了把之前给你的 Features 也带上

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <Hero />
      <ResearchList />
      <Features />
    </div>
  );
}