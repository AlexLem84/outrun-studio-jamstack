import { defineType, defineField } from 'sanity'

export const portfolioProject = defineType({
  name: 'portfolioProject',
  title: 'Portfolio Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
      options: {
        list: [
          { title: 'Web Design', value: 'web-design' },
          { title: 'SEO', value: 'seo' },
          { title: 'PPC Campaign', value: 'ppc' },
          { title: 'Branding', value: 'branding' },
          { title: 'Graphic Design', value: 'graphic-design' },
          { title: 'Full Digital Marketing', value: 'full-marketing' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Project Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'challenge',
      title: 'Client Challenge',
      type: 'text',
      rows: 3,
      description: 'What problem were we solving?',
    }),
    defineField({
      name: 'solution',
      title: 'Our Solution',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'object',
      fields: [
        { name: 'trafficIncrease', type: 'number', title: 'Traffic Increase (%)' },
        { name: 'conversionRate', type: 'number', title: 'Conversion Rate (%)' },
        { name: 'roi', type: 'number', title: 'ROI (%)' },
        { name: 'customMetric', type: 'string', title: 'Custom Metric' },
        { name: 'customValue', type: 'string', title: 'Custom Value' },
      ],
    }),
    defineField({
      name: 'testimonial',
      title: 'Client Testimonial',
      type: 'object',
      fields: [
        { name: 'quote', type: 'text', title: 'Quote' },
        { name: 'author', type: 'string', title: 'Author Name' },
        { name: 'position', type: 'string', title: 'Position/Company' },
        { name: 'avatar', type: 'image', title: 'Author Photo' },
      ],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Project Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'beforeAfterImages',
      title: 'Before & After Images',
      type: 'object',
      fields: [
        { name: 'before', type: 'image', title: 'Before Image' },
        { name: 'after', type: 'image', title: 'After Image' },
      ],
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'projectUrl',
      title: 'Live Project URL',
      type: 'url',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Show on homepage',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', type: 'string', title: 'Meta Title' },
        { name: 'metaDescription', type: 'text', title: 'Meta Description' },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      client: 'client',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { title, client } = selection
      return {
        title: title,
        subtitle: `Client: ${client}`,
      }
    },
  },
})
