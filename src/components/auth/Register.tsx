/**
 * Register Page
 * Página de cadastro de novos usuários
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../common';
import './Register.css';

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess: _onSuccess, onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      return 'Email é obrigatório';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Email inválido';
    }

    if (formData.password.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      return 'A senha deve conter letras maiúsculas, minúsculas e números';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem';
    }

    if (formData.phoneNumber && !/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      return 'Número de telefone inválido';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar formulário
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber || undefined,
      });

      if (error) {
        setError(getErrorMessage(error.message));
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const _getErrorMessage = (message: string): string => {
    const errors: Record<string, string> = {
      'User already registered': 'Este email já está cadastrado',
      'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres',
      'Invalid email': 'Email inválido',
      'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos',
    };

    return errors[message] || message;
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="register-success">
            <h2>🎉 Conta Criada!</h2>
            <p>
              Enviamos um email de confirmação para <strong>{formData.email}</strong>
            </p>
            <p className="text-muted">
              Verifique sua caixa de entrada e confirme seu email para começar a usar
            </p>
            <Button onClick={onSwitchToLogin} fullWidth>
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>💰 My-Financify</h1>
          <p>Crie sua conta gratuitamente</p>
        </div>

        {error && (
          <div className="register-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <Input
            type="text"
            name="fullName"
            label="Nome Completo"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="João da Silva"
            required
            disabled={loading}
          />

          <Input
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
            disabled={loading}
          />

          <Input
            type="tel"
            name="phoneNumber"
            label="Telefone (opcional)"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+55 11 98765-4321"
            disabled={loading}
          />

          <Input
            type="password"
            name="password"
            label="Senha"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <div className="password-requirements">
            <p className="requirements-title">A senha deve conter:</p>
            <ul>
              <li className={formData.password.length >= 6 ? 'valid' : ''}>
                ✓ Mínimo de 6 caracteres
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                ✓ Letras minúsculas
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                ✓ Letras maiúsculas
              </li>
              <li className={/\d/.test(formData.password) ? 'valid' : ''}>
                ✓ Números
              </li>
            </ul>
          </div>

          <Input
            type="password"
            name="confirmPassword"
            label="Confirmar Senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <Button type="submit" fullWidth loading={loading}>
            Criar Conta
          </Button>
        </form>

        <div className="register-footer">
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Já tem uma conta? <strong>Fazer login</strong>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
