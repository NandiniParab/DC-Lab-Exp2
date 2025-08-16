import { AuthProvider } from "./contexts/AuthContext"
import { GameProvider } from "./contexts/GameContext"
import MainApp from "./components/MainApp"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <div className="App">
          <MainApp />
        </div>
      </GameProvider>
    </AuthProvider>
  )
}

export default App
