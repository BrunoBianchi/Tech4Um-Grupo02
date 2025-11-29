import { useState } from 'react';
import { useAuth } from '../hooks/auth-hook';
import { api } from '../services/axios';

export default function LoginModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password).then((u) => {
          console.log(u)
        })

      } else if (mode === 'register') {
        await register(formData.name, formData.email, formData.password);
        onClose(); // Close modal on success
      } else if (mode === 'forgot') {
        // Placeholder for forgot password
        alert('Funcionalidade de recuperação de senha enviada para o e-mail (simulação).');
        setMode('login');
      }
    } catch (err) {
      setError('Ocorreu um erro. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white rounded-3xl p-10 w-[500px] relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-[#2d80d2] mb-2 text-center">
          {mode === 'login' && 'Que bom ter você aqui!'}
          {mode === 'register' && 'Crie sua conta'}
          {mode === 'forgot' && 'Recuperar senha'}
        </h2>

        <p className="text-gray-500 mb-8 text-center text-sm">
          {mode === 'login' && 'Para participar de um 4um é necessário fazer login.'}
          {mode === 'register' && 'Preencha os dados abaixo para começar.'}
          {mode === 'forgot' && 'Informe seu e-mail para receber instruções.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-sm ml-1">Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#2d80d2] transition-colors"
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-sm ml-1">E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#2d80d2] transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-sm ml-1">Senha</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#2d80d2] transition-colors"
                placeholder="********"
                required
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#1e70b9] text-white font-bold py-3 rounded-lg mt-2 hover:bg-[#165a96] transition-colors disabled:opacity-70"
          >
            {loading ? 'Carregando...' : (
              mode === 'login' ? 'Entrar' :
                mode === 'register' ? 'Cadastrar' : 'Enviar'
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-600">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('forgot')} className="hover:text-[#1e70b9] hover:underline">
                Esqueci minha senha
              </button>
              <p>
                Não tem uma conta?{' '}
                <button onClick={() => setMode('register')} className="text-[#1e70b9] font-bold hover:underline">
                  Criar conta
                </button>
              </p>
            </>
          )}

          {(mode === 'register' || mode === 'forgot') && (
            <button onClick={() => setMode('login')} className="text-[#1e70b9] font-bold hover:underline">
              Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
