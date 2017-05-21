/** @jsx createElement */
import { createElement } from 'elliptical'
import { Command, String } from 'lacona-phrases'
import { setClipboard } from 'lacona-api'

import _ from 'lodash'
import fetch from 'node-fetch'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { interval } from 'rxjs/observable/interval'
import { mergeMap } from 'rxjs/operator/mergeMap'
import { concat } from 'rxjs/operator/concat'

const GETDANGO_URL = "https://emoji.getdango.com/api/emoji?q="


function fetchEmojis (query) {
  return fetch(GETDANGO_URL + query)
    .then(res => res.json())
    .then(data => {
      return data.results
    })
    .catch(e => console.error(`Error connecting to fixer.io: ${e}`))
}

const EmojisSource = {
  fetch ({props}) {
    return fromPromise(fetchEmojis(props.query))
  }
}

const Query = {
  describe ({props}) {
    return <String limit={1} label='write something' splitOn={/\s/} {...props} />
  }
}

export const EmojiFromText = {
  extends: [Command],

  execute (result, {observe}) {
    const emojis = observe(<EmojisSource query={result.query} />)

    if (emojis) {
      let output
      if (emojis.length === 1) {
        output = emojis[0].text
      } else {
        output = _.map(emojis, ({score, text}) => {
          return text
        }).join('\n')
      }
      setClipboard({text: output})
    }
  },

  preview (result, {observe}) {
    const emojis = observe(<EmojisSource query={result.query} />)
    if (emojis) {

      const strings = _.map(emojis, ({score, text}) => {
        return `<span id="${text}">${text}</span>`
      })
      
      const html = strings.join('<br />')

      return {type: 'html', value: html}
    }
  },

  describe ({observe}) {
    return (
        <sequence>
          <literal text='emoji ' />
          <Query id='query' consumeAll />
        </sequence>
    )
  }
}

export const extensions = [EmojiFromText]
