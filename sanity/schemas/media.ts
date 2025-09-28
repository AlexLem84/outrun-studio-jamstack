import { defineField, defineType } from 'sanity'

export const media = defineType({
  name: 'media',
  title: 'Media Library',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'A descriptive title for the media item (e.g., "Outrun Studio Logo", "Business Card Icon")',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the media item.',
    }),
    defineField({
      name: 'image',
      title: 'Image File',
      type: 'image',
      options: {
        hotspot: true, // Enables hotspot for cropping
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Important for SEO and accessibility.',
        }),
      ],
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Logo', value: 'logo' },
          { title: 'Icon', value: 'icon' },
          { title: 'Project Image', value: 'projectImage' },
          { title: 'Background Image', value: 'backgroundImage' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'other',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Keywords to help categorize and search for media items.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'mediaType',
      media: 'image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Media',
        subtitle: subtitle ? `Type: ${subtitle}` : '',
        media,
      };
    },
  },
})
