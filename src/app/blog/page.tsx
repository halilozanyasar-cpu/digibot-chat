import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';

// Mock blog data - in production, this would come from a CMS or database
const blogPosts = [
  {
    id: '1',
    title: 'Dijital Cerrahi Rehberlerinin Avantajları',
    excerpt: 'Modern implantoloji uygulamalarında dijital cerrahi rehberlerinin sağladığı avantajları ve hasta sonuçlarına etkisini inceleyelim.',
    content: 'Dijital cerrahi rehberler, geleneksel yöntemlere göre daha hassas implant yerleşimi sağlar...',
    author: 'Dr. Ahmet Yılmaz',
    date: '2024-01-15',
    readTime: '5 dk',
    category: 'Teknoloji',
    image: '/api/placeholder/400/250',
    featured: true,
  },
  {
    id: '2',
    title: 'İmplant Başarısını Artıran Faktörler',
    excerpt: 'İmplant cerrahisinde başarı oranını artıran temel faktörler ve dikkat edilmesi gereken noktalar.',
    content: 'İmplant cerrahisinde başarı, birçok faktörün doğru şekilde yönetilmesine bağlıdır...',
    author: 'Dr. Ayşe Demir',
    date: '2024-01-10',
    readTime: '7 dk',
    category: 'Klinik',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: '3',
    title: 'QR Kodlu Rapor Sisteminin Faydaları',
    excerpt: 'Hasta takibi ve raporlama süreçlerinde QR kod teknolojisinin getirdiği kolaylıklar.',
    content: 'QR kod teknolojisi, hasta bilgilerine hızlı erişim sağlayarak...',
    author: 'Dr. Mehmet Kaya',
    date: '2024-01-05',
    readTime: '4 dk',
    category: 'Teknoloji',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: '4',
    title: 'AI Destekli Cerrahi Planlama',
    excerpt: 'Yapay zeka teknolojisinin cerrahi planlama süreçlerindeki rolü ve gelecekteki potansiyeli.',
    content: 'Yapay zeka, cerrahi planlama süreçlerinde devrim yaratıyor...',
    author: 'Dr. Zeynep Özkan',
    date: '2024-01-01',
    readTime: '6 dk',
    category: 'AI',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: '5',
    title: 'İmplant Markaları Karşılaştırması',
    excerpt: 'Piyasadaki önde gelen implant markalarının özelliklerini ve kullanım alanlarını karşılaştırıyoruz.',
    content: 'İmplant seçimi, cerrahi başarının temel taşlarından biridir...',
    author: 'Dr. Can Arslan',
    date: '2023-12-28',
    readTime: '8 dk',
    category: 'Ürün',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: '6',
    title: 'Post-Operatif Bakım Rehberi',
    excerpt: 'İmplant cerrahisi sonrası hasta bakımı ve iyileşme sürecinde dikkat edilmesi gerekenler.',
    content: 'Post-operatif bakım, implant başarısının kritik bir parçasıdır...',
    author: 'Dr. Elif Şahin',
    date: '2023-12-25',
    readTime: '5 dk',
    category: 'Klinik',
    image: '/api/placeholder/400/250',
    featured: false,
  },
];

const categories = ['Tümü', 'Teknoloji', 'Klinik', 'AI', 'Ürün'];

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-6">
              Blog
            </h1>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Dental implantoloji dünyasından en güncel haberler, teknik bilgiler ve uzman görüşleri
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-8 mb-20">
          {categories.map((category) => (
            <button
              key={category}
              className="px-8 py-3 rounded-full glass text-white font-medium hover:scale-105 transition-all duration-300"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-16 drop-shadow-lg">Öne Çıkan Makale</h2>
            <div className="glass rounded-3xl shadow-2xl overflow-hidden hover-lift">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-10">
                  <div className="flex items-center mb-6">
                    <span className="bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-full ml-3">
                      Öne Çıkan
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">
                    {featuredPost.title}
                  </h3>
                  <p className="text-white/90 text-lg mb-8 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-white/80 mb-8">
                    <User className="w-5 h-5 mr-2" />
                    <span className="mr-6">{featuredPost.author}</span>
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="mr-6">{new Date(featuredPost.date).toLocaleDateString('tr-TR')}</span>
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="btn-modern inline-flex items-center space-x-3 text-lg px-8 py-4"
                  >
                    <span>Devamını Oku</span>
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Son Makaleler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User className="w-4 h-4 mr-2" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="mr-4">{new Date(post.date).toLocaleDateString('tr-TR')}</span>
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center space-x-1"
                  >
                    <span>Devamını Oku</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Blog Güncellemelerini Kaçırmayın
          </h3>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Dental implantoloji dünyasından en güncel haberler ve teknik bilgiler için e-posta listemize katılın.
          </p>
          <div className="max-w-md mx-auto flex space-x-4">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Abone Ol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
