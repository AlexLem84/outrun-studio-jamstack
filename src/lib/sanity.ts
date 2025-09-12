import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: '01wpc9nr',
  dataset: 'production',
  useCdn: true, // Set to false if statically generating pages at build time
  apiVersion: '2023-05-03', // Use current date (YYYY-MM-DD) to target the latest API version
})

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(client)

// Then we like to make a simple function like this that gives the
// builder an image and returns the builder for you to specify additional
// parameters:
export function urlFor(source: any) {
  return builder.image(source)
}

// Helper function to get all services
export async function getServices() {
  return await client.fetch('*[_type == "service"] | order(_createdAt desc)')
}

// Helper function to get all portfolio projects
export async function getPortfolioProjects() {
  return await client.fetch('*[_type == "portfolioProject"] | order(_createdAt desc)')
}

// Helper function to get featured portfolio projects
export async function getFeaturedPortfolioProjects() {
  return await client.fetch('*[_type == "portfolioProject" && featured == true] | order(_createdAt desc)')
}

// Helper function to get all testimonials
export async function getTestimonials() {
  return await client.fetch('*[_type == "testimonial" && published == true] | order(_createdAt desc)')
}

// Helper function to get featured testimonials
export async function getFeaturedTestimonials() {
  return await client.fetch('*[_type == "testimonial" && featured == true && published == true] | order(_createdAt desc)')
}

// Helper function to get all blog posts
export async function getPosts() {
  return await client.fetch('*[_type == "post"] | order(publishedAt desc)')
}

// Helper function to get featured blog posts
export async function getFeaturedPosts() {
  return await client.fetch('*[_type == "post" && featured == true] | order(publishedAt desc)')
}

// Helper function to get team members
export async function getTeamMembers() {
  return await client.fetch('*[_type == "teamMember"] | order(order asc, _createdAt desc)')
}

// Helper function to get featured team members
export async function getFeaturedTeamMembers() {
  return await client.fetch('*[_type == "teamMember" && featured == true] | order(order asc, _createdAt desc)')
}

// Helper function to get a single post by slug
export async function getPostBySlug(slug: string) {
  return await client.fetch(`*[_type == "post" && slug.current == "${slug}"][0]`)
}

// Helper function to get a single service by slug
export async function getServiceBySlug(slug: string) {
  return await client.fetch(`*[_type == "service" && slug.current == "${slug}"][0]`)
}

// Helper function to get a single portfolio project by slug
export async function getPortfolioProjectBySlug(slug: string) {
  return await client.fetch(`*[_type == "portfolioProject" && slug.current == "${slug}"][0]`)
}
