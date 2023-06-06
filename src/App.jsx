import Header from './components/Header';
import Table from './components/Table';
import './App.css';

const App = () => {
  return (
    <main>
        <div className='main'>
            <div className='gradient' />
        </div>
        <div className='app'>
             <Header />
             <Table />
        </div>
    </main>
  )
}

export default App