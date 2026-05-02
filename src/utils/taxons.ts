
export interface TaxonNode {
  id: string
  VernacularName: string
  ScientificName: string
  rank: TaxonomicRank
  children?: TaxonNode[]
  parent?: string
}

export enum TaxonomicRank {
  CLASS = 'tax_class',
  ORDER = 'order',
  FAMILY = 'family',
  GENUS = 'genus',
  SPECIES = 'species'
}

export const getTaxonomicLevel = (depth: number): TaxonomicRank => {
  const levels = [
    TaxonomicRank.CLASS,
    TaxonomicRank.ORDER,
    TaxonomicRank.FAMILY,
    TaxonomicRank.GENUS,
    TaxonomicRank.SPECIES
  ]
  return levels[depth] || levels[levels.length - 1]
}


export const getTaxonomicTranslation = (rank: TaxonomicRank): string => {
  switch (rank) {
    case TaxonomicRank.CLASS:
      return 'Klass'
    case TaxonomicRank.ORDER:
      return 'Ordning'
    case TaxonomicRank.FAMILY:
      return 'Familj'
    case TaxonomicRank.GENUS:
      return 'Genus'
    case TaxonomicRank.SPECIES:
      return 'Art'
    default:
      return ''
  }
}