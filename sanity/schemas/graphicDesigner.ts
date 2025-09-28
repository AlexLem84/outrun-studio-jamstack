import { defineType } from 'sanity'

export const graphicDesigner = defineType({
  name: 'graphicDesigner',
  title: 'Graphic Designer Section',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Main heading for the Graphic Designer section',
      validation: (Rule) => Rule.required().max(100)
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Subtitle or tagline for the section',
      validation: (Rule) => Rule.max(200)
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  }
                ]
              }
            ]
          }
        }
      ],
      description: 'Main content for the Graphic Designer section'
    },
    {
      name: 'ctaButton',
      title: 'Call to Action Button',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Button Text',
          type: 'string',
          validation: (Rule) => Rule.required().max(50)
        },
        {
          name: 'link',
          title: 'Button Link',
          type: 'url',
          validation: (Rule) => Rule.required()
        }
      ]
    },
    {
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility'
        }
      ]
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle to show/hide this section on the homepage',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle'
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title || 'Graphic Designer Section',
        subtitle: subtitle || 'No subtitle'
      }
    }
  }
})
