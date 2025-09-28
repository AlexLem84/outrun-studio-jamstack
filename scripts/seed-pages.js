import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '01wpc9nr',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_TOKEN, // You'll need to add this to your .env file
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
            text: 'Learn more about Outrun Studio and our mission to help businesses outrun the competition through innovative digital marketing solutions.'
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
            text: 'Our comprehensive digital marketing services include web design, SEO, PPC advertising, and more. Let us help you achieve your business goals.'
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
            text: 'Ready to transform your digital presence? Contact Outrun Studio for a free consultation. We\'re here to help your business outrun the competition.'
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

async function seedPages() {
  try {
    console.log('Creating pages in Sanity...')
    
    for (const page of pages) {
      const existingPage = await client.fetch(`*[_type == "page" && slug.current == "${page.slug.current}"][0]`)
      
      if (!existingPage) {
        await client.create(page)
        console.log(`✅ Created page: ${page.title}`)
      } else {
        console.log(`⏭️  Page already exists: ${page.title}`)
      }
    }
    
    console.log('🎉 Pages created successfully!')
  } catch (error) {
    console.error('❌ Error creating pages:', error)
  }
}

seedPages()
