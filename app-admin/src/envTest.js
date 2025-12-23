// Test file to check environment variable loading
console.log('=== SIMPLE ENV TEST ===');
console.log('process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('process.env.REACT_APP_AUTH_URL:', process.env.REACT_APP_AUTH_URL);
console.log('All REACT_APP variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('========================');

export default function EnvTest() {
  return <div>Check console for environment variables</div>;
}