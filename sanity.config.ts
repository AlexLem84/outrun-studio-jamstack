import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

// Import your schemas
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'outrun-studio',
  title: 'Outrun Studio CMS',
  
  projectId: '01wpc9nr',
  dataset: 'production',
  
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Pages')
              .child(
                S.documentTypeList('page')
                  .title('Pages')
              ),
            S.listItem()
              .title('Services')
              .child(
                S.documentTypeList('service')
                  .title('Services')
              ),
            S.listItem()
              .title('Portfolio')
              .child(
                S.documentTypeList('portfolioProject')
                  .title('Portfolio Projects')
              ),
            S.listItem()
              .title('Blog Posts')
              .child(
                S.documentTypeList('post')
                  .title('Blog Posts')
              ),
            S.listItem()
              .title('Team Members')
              .child(
                S.documentTypeList('teamMember')
                  .title('Team Members')
              ),
            S.listItem()
              .title('Testimonials')
              .child(
                S.documentTypeList('testimonial')
                  .title('Testimonials')
              ),
            S.listItem()
              .title('Homepage Hero')
              .child(
                S.documentTypeList('homepageHero')
                  .title('Homepage Hero')
              ),
            S.listItem()
              .title('Media Library')
              .child(
                S.documentTypeList('media')
                  .title('Media Library')
              ),
          ])
    }),
    visionTool()
  ],
  
  schema: {
    types: schemaTypes,
  },
})
