import logoImage from '../assets/logo.png';

const Header = () => {
  return (
    <header className="app-header">
      <img src={logoImage} alt="Investment Planner Logo" className="app-logo" style={{ maxHeight: '50px' }} />
      <h1>Investment Planner</h1>
      <p className="app-subtitle">Plan, visualize, and compare your investments and loans</p>
    </header>
  );
};

export default Header;
