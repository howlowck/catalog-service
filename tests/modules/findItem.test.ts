import data from '../../src/core/data'
import { findDisambiguationValues, ConceptAssociation, filterDisambiguationValues, getCandidateItemsFromLabelSearchResult, focusLabelResult } from '../../src/modules/findItem'
import { ItemDefinition } from 'common-catalog-schema'
import { SchemaType } from '../../src/types/generic'

describe('findDisambiguationValues Method', () => {
  it('finds single converging disambiguation attribute', () => {
    const itemIds = ['pork-egg-rolls', 'chicken-egg-rolls']
    const items: ItemDefinition[] = data.items.filter((item) => {
      return itemIds.includes(item.id)
    })

    const actual = findDisambiguationValues(items)
    const expected: ConceptAssociation[] = [
      {
        conceptId: 'protein',
        associations: [
          {
            conceptValue: 'pork',
            itemId: 'pork-egg-rolls'
          },
          {
            conceptValue: 'chicken',
            itemId: 'chicken-egg-rolls'
          }
        ]
      }
    ]
    expect(actual).toMatchObject(expected)
  })

  it('finds multiple diverging disambiguation attributes resulting in different products', () => {
    const itemIds = ['pork-egg-rolls', 'chicken-egg-rolls', 'small-iced-milk-tea']
    const items: ItemDefinition[] = data.items.filter((item) => {
      return itemIds.includes(item.id)
    })

    const actual = findDisambiguationValues(items)
    const expected: ConceptAssociation[] = [
      {
        conceptId: 'protein',
        associations: [
          {
            conceptValue: 'pork',
            itemId: 'pork-egg-rolls'
          },
          {
            conceptValue: 'chicken',
            itemId: 'chicken-egg-rolls'
          }
        ]
      },
      {
        conceptId: 'tea-temperature',
        associations: [{
          conceptValue: 'cold',
          itemId: 'small-iced-milk-tea'
        }]
      },
      {
        conceptId: 'drink-size',
        associations: [{
          conceptValue: 'small',
          itemId: 'small-iced-milk-tea'
        }]
      }
    ]
    expect(actual).toMatchObject(expected)
  })

  it('finds multiple disambiguation attributes resulting in similar products', () => {
    const itemIds = ['small-iced-milk-tea', 'small-hot-milk-tea', 'hot-milk-tea', 'iced-milk-tea']
    const items: ItemDefinition[] = data.items.filter((item) => {
      return itemIds.includes(item.id)
    })

    const actual = findDisambiguationValues(items)
    const expected: ConceptAssociation[] =
      [{
        conceptId: 'tea-temperature',
        associations: [{
          conceptValue: 'hot',
          itemId: 'hot-milk-tea'
        }, {
          conceptValue: 'hot',
          itemId: 'small-hot-milk-tea'
        }, {
          conceptValue: 'cold',
          itemId: 'iced-milk-tea'
        }, {
          conceptValue: 'cold',
          itemId: 'small-iced-milk-tea'
        }]
      }, {
        conceptId: 'drink-size',
        associations: [{
          conceptValue: 'medium',
          itemId: 'hot-milk-tea'
        }, {
          conceptValue: 'small',
          itemId: 'small-hot-milk-tea'
        }, {
          conceptValue: 'medium',
          itemId: 'iced-milk-tea'
        }, {
          conceptValue: 'small',
          itemId: 'small-iced-milk-tea'
        }]
      }]

    expect(actual).toMatchObject(expected)
  })
})

describe('filterDisambiguationValues', () => {
  it('filters down multiple disambiguation items', () => {
    const associations = [{
      conceptId: 'tea-temperature',
      associations: [{
        conceptValue: 'hot',
        itemId: 'hot-milk-tea'
      }, {
        conceptValue: 'hot',
        itemId: 'small-hot-milk-tea'
      }, {
        conceptValue: 'cold',
        itemId: 'iced-milk-tea'
      }, {
        conceptValue: 'cold',
        itemId: 'small-iced-milk-tea'
      }]
    }, {
      conceptId: 'drink-size',
      associations: [{
        conceptValue: 'medium',
        itemId: 'hot-milk-tea'
      }, {
        conceptValue: 'small',
        itemId: 'small-hot-milk-tea'
      }, {
        conceptValue: 'medium',
        itemId: 'iced-milk-tea'
      }, {
        conceptValue: 'small',
        itemId: 'small-iced-milk-tea'
      }]
    }]

    const actual = filterDisambiguationValues(associations, [{ conceptId: 'tea-temperature', key: 'hot' }, { conceptId: 'temperature', key: 'hot' }])
    const expected = {
      identified: {
        conceptId: 'tea-temperature',
        associations: [{
          conceptValue: 'hot',
          itemId: 'hot-milk-tea'
        }, {
          conceptValue: 'hot',
          itemId: 'small-hot-milk-tea'
        }]
      },
      remaining: [{
        conceptId: 'drink-size',
        associations: [{
          conceptValue: 'medium',
          itemId: 'hot-milk-tea'
        }, {
          conceptValue: 'small',
          itemId: 'small-hot-milk-tea'
        }]
      }]
    }

    expect(actual).toMatchObject(expected)
  })

  it('filters down to a single item', () => {
    const associations = [{
      conceptId: 'drink-size',
      associations: [{
        conceptValue: 'medium',
        itemId: 'hot-milk-tea'
      }, {
        conceptValue: 'small',
        itemId: 'small-hot-milk-tea'
      }]
    }]

    const actual = filterDisambiguationValues(associations, [{ conceptId: 'drink-size', key: 'small' }])
    const expected = {
      identified: {
        conceptId: 'drink-size',
        associations: [{
          conceptValue: 'small',
          itemId: 'small-hot-milk-tea'
        }]
      },
      remaining: []
    }

    expect(actual).toMatchObject(expected)
  })
})

describe('getCandidateItems', () => {
  it('gets all the items from classifications', () => {
    const searchResult = {
      label: 'egg roll',
      classifications: [
        {
          type: SchemaType.classification,
          value: 'egg-roll',
          score: 1
        }
      ],
      items: [
        {
          type: SchemaType.item,
          value: 'pork-egg-rolls',
          score: 0.95
        },
        {
          type: SchemaType.item,
          value: 'chicken-egg-rolls',
          score: 0.92
        },
        {
          type: SchemaType.item,
          value: 'strawberry-spring-rolls',
          score: 0.898
        },
        {
          type: SchemaType.item,
          value: 'spring-rolls',
          score: 0.72
        },
        {
          type: SchemaType.item,
          value: 'egg-drop-soup',
          score: 0.625
        }
      ],
      concepts: [ ]
    }
    const actual = getCandidateItemsFromLabelSearchResult(data, searchResult)
    const itemIds = ['pork-egg-rolls', 'chicken-egg-rolls']
    const expected: ItemDefinition[] = data.items.filter((item) => {
      return itemIds.includes(item.id)
    })

    expect(actual).toMatchObject(expected)
  })

  it('gets all item search Results when no classifications are found', () => {
    const searchResult = {
      label: 'egg roll',
      classifications: [],
      items: [
        {
          type: SchemaType.item,
          value: 'pork-egg-rolls',
          score: 0.95
        },
        {
          type: SchemaType.item,
          value: 'chicken-egg-rolls',
          score: 0.92
        }
      ],
      concepts: []
    }
    const actual = getCandidateItemsFromLabelSearchResult(data, searchResult)
    const itemIds = ['pork-egg-rolls', 'chicken-egg-rolls']
    const expected: ItemDefinition[] = data.items.filter((item) => {
      return itemIds.includes(item.id)
    })

    expect(actual).toMatchObject(expected)
  })
})

describe('focusLabelSearchResult', () => {
  it('focuses classification properly', () => {
    const labelSearchResults = [
      {
        label: 'egg roll',
        classifications: [
          {
            type: SchemaType.classification,
            value: 'egg-roll',
            score: 1
          }
        ],
        items: [
          {
            type: SchemaType.item,
            value: 'pork-egg-rolls',
            score: 0.95
          },
          {
            type: SchemaType.item,
            value: 'chicken-egg-rolls',
            score: 0.92
          },
          {
            type: SchemaType.item,
            value: 'strawberry-spring-rolls',
            score: 0.898
          },
          {
            type: SchemaType.item,
            value: 'spring-rolls',
            score: 0.72
          },
          {
            type: SchemaType.item,
            value: 'egg-drop-soup',
            score: 0.625
          }
        ],
        concepts: [ ]
      },
      {
        label: 'pork',
        classifications: [
          {
            type: SchemaType.classification,
            value: 'pork',
            score: 1
          }
        ],
        items: [
          {
            type: SchemaType.item,
            value: 'pork-dumplings',
            score: 0.999
          },
          {
            type: SchemaType.item,
            value: 'pork-egg-rolls',
            score: 0.999
          },
          {
            type: SchemaType.item,
            value: 'new-york-cheesecake',
            score: 0.913
          }
        ],
        concepts: [
          {
            type: SchemaType.concept,
            value: 'protein:pork',
            score: 1
          },
          {
            type: SchemaType.concept,
            value: 'carb-protein:pork',
            score: 1
          },
          {
            type: SchemaType.concept,
            value: 'egg-roll-choice:pork',
            score: 1
          }
        ]
      }
    ]
    const actual = focusLabelResult(data, labelSearchResults, 'egg roll')
    const expected = {
      identified: [{
        conceptId: 'protein',
        associations: [
          {
            conceptValue: 'pork',
            itemId: 'pork-egg-rolls'
          }
        ]
      }],
      remaining: []
    }

    expect(actual).toMatchObject(expected)
  })
})
