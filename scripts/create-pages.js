import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '01wpc9nr',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
})

const pages = [
  {
    _type: 'page',
    title: 'Home',
    slug: { current: 'home' },
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Welcome to Outrun Studio - Idaho Falls\' premier digital marketing agency specializing in web design, graphic design, SEO, and PPC advertising. Transform your online presence today!'
          }
        ]
      }
    ]
  },
  {
    _type: 'page',
    title: 'About',
    slug: { current: 'about' },
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Idaho Falls\' premier digital marketing agency dedicated to helping businesses achieve remarkable results through innovative design and strategic marketing.'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'At Outrun Studio, we believe that every business deserves a digital presence that not only looks amazing but performs exceptionally. We specialize in creating fast, modern websites and compelling visual designs that help businesses stand out in the competitive digital landscape.'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Our team combines creativity with technical expertise to deliver solutions that drive real results. From web design and graphic design to SEO and PPC advertising, we provide comprehensive digital marketing services tailored to your business needs.'
          }
        ]
      }
    ]
  },
  {
    _type: 'page',
    title: 'Services',
    slug: { current: 'services' },
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Comprehensive digital marketing solutions designed to help your business stand out and achieve remarkable results.'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Web Design: Modern, responsive websites that convert visitors into customers with lightning-fast load times and beautiful design.'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Graphic Design: Professional branding, logos, and visual assets that make your business memorable and stand out from the competition.'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'SEO: Search engine optimization that gets your business found by customers actively searching for your products or services.'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'PPC Advertising: Targeted pay-per-click campaigns that drive qualified traffic and maximize your return on advertising investment.'
          }
        ]
      }
    ]
  },
  {
    _type: 'page',
    title: 'Portfolio',
    slug: { current: 'portfolio' },
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Explore our portfolio of successful digital marketing projects and see how we\'ve helped businesses grow their online presence.'
          }
        ]
      }
    ]
  },
  {
    _type: 'page',
    title: 'Contact',
    slug: { current: 'contact' },
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Ready to transform your digital presence? Let\'s discuss your project goals and how we can help your business achieve remarkable results.'
          }
        ]
      }
    ]
  },
  {
    _type: 'page',
    title: 'Blog',
    slug: { current: 'blog' },
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Stay updated with the latest digital marketing insights, tips, and industry news from Outrun Studio.'
          }
        ]
      }
    ]
  }
]

async function createPages() {
  try {
    console.log('🚀 Creating pages in Sanity CMS...')
    
    for (const page of pages) {
      // Check if page already exists
      const existingPage = await client.fetch(`*[_type == "page" && slug.current == "${page.slug.current}"][0]`)
      
      if (!existingPage) {
        const createdPage = await client.create(page)
        console.log(`✅ Created page: ${page.title} (ID: ${createdPage._id})`)
      } else {
        console.log(`⏭️  Page already exists: ${page.title}`)
      }
    }
    
    console.log('🎉 All pages created successfully!')
    console.log('📝 You can now edit these pages in Sanity Studio at http://localhost:3333')
  } catch (error) {
    console.error('❌ Error creating pages:', error)
  }
}

createPages()
