import { type SchemaTypeDefinition } from 'sanity'
import post from './post'
import bioPage from './bioPage'
import canvasPage from './canvasPage'
import sparPage from './sparPage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, bioPage, canvasPage, sparPage],
}
