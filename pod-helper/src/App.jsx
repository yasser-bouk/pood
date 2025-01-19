import React, { useState } from 'react'
    import axios from 'axios'
    import './index.css'

    const App = () => {
      const [niche, setNiche] = useState('')
      const [loading, setLoading] = useState(false)
      const [results, setResults] = useState(null)
      const [error, setError] = useState(null)

      const formatResponse = (content) => {
        const lines = content.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
        
        const title = lines[0] || 'Untitled Design'
        
        const ballpoints = lines
          .slice(1)
          .filter(line => /^\d+\.\s+|^[-•*]\s+/.test(line))
          .map(line => line.replace(/^\d+\.\s+|^[-•*]\s+/, ''))
        
        const description = lines
          .slice(1)
          .filter(line => !/^\d+\.\s+|^[-•*]\s+/.test(line))
          .join(' ')
          .replace('Description:', '')
          .trim() || 'No description generated'

        return {
          title,
          ballpoints: ballpoints.length >= 2 ? ballpoints.slice(0, 2) : [
            'No ballpoint generated',
            'No ballpoint generated'
          ],
          description
        }
      }

      const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
          const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [{
              role: "user",
              content: `Generate a title, two ballpoints, and a description for a POD design in the ${niche} niche for Amazon Merch. 
                       Format as: Title\n1. Ballpoint 1\n2. Ballpoint 2\nDescription`
            }],
            temperature: 0.7,
            max_tokens: 150
          }, {
            headers: {
              'Authorization': 'Bearer sk-1174c0d850c242e1b03944933c9f79d1',
              'Content-Type': 'application/json'
            }
          })
          
          setResults(formatResponse(response.data.choices[0].message.content))
        } catch (error) {
          console.error('API Error:', error)
          setError('Failed to generate ideas. Please try again.')
        } finally {
          setLoading(false)
        }
      }

      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
          .then(() => alert('Copied to clipboard!'))
          .catch(() => alert('Failed to copy!'))
      }

      return (
        <div className="container">
          <header className="header">
            <h1 className="title">POD Helper</h1>
            <p className="subtitle">AI-powered design ideas for Amazon Merch</p>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="niche">Enter Niche:</label>
              <input
                type="text"
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., Fitness, Pets, Travel"
                required
              />
            </div>
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                'Generate Ideas'
              )}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {results && !error && (
            <div className="results-card">
              <div className="results-header">
                <h2 className="results-title">
                  {results.title}
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(results.title)}
                  >
                    📋 Copy
                  </button>
                </h2>
                <span className="platform-badge">
                  🛍️ Amazon Merch
                </span>
              </div>
              
              <div className="results-content">
                {results.ballpoints.map((point, index) => (
                  <div className="ballpoint" key={index}>
                    <span className="ballpoint-number">{index + 1}</span>
                    <p>{point}</p>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(point)}
                    >
                      📋 Copy
                    </button>
                  </div>
                ))}
                
                <div className="description">
                  <h3>
                    Description
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(results.description)}
                    >
                      📋 Copy
                    </button>
                  </h3>
                  <p>{results.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    export default App
