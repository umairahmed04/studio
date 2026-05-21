'use client';

interface AboutProps {
  content: {
    title?: string;
    description?: string;
    imageUrl?: string;
    list?: string[];
  };
}

export function CmsAbout({ content }: AboutProps) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              {content.title || 'Why Choose Our AI Optimization?'}
            </h2>
            <div 
              className="text-lg text-muted-foreground prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-foreground prose-ul:space-y-2 prose-li:text-sm" 
              dangerouslySetInnerHTML={{ __html: content.description || '' }} 
            />
            {content.list && content.list.length > 0 && (
              <ul className="space-y-4 pt-4">
                {content.list.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm items-center">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative aspect-square rounded-3xl overflow-hidden glass border-white/5">
              <img 
                src={content.imageUrl || 'https://picsum.photos/seed/about/800/800'} 
                alt="About Us" 
                className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-700"
                data-ai-hint="Professional office workspace"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
