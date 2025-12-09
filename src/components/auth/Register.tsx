/**
 * Register Page
 * Página de cadastro de novos usuários com validação de CPF
 * 
 * @version 2.0.0 - Adicionado validação de CPF
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../common';
import { validateCPF, maskCPFInput, cleanCPF } from '../../utils/cpf';
import CPFValidationService from '../../services/cpf-validation.service';
import './Register.css';

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess: _onSuccess, onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [cpfValidation, setCpfValidation] = useState<{
    valid: boolean;
    error?: string;
    checking?: boolean;
  }>({ valid: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar máscara de CPF enquanto digita
    if (name === 'cpf') {
      const masked = maskCPFInput(value);
      setFormData({
        ...formData,
        cpf: masked,
      });
      
      // Validar CPF em tempo real
      validateCPFField(masked);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Validação de CPF em tempo real
  const validateCPFField = async (cpf: string) => {
    const cleaned = cleanCPF(cpf);
    
    // Só validar se tiver 11 dígitos
    if (cleaned.length !== 11) {
      setCpfValidation({ valid: false });
      return;
    }
    
    // Validar formato
    const formatValidation = validateCPF(cleaned);
    if (!formatValidation.valid) {
      setCpfValidation({ 
        valid: false, 
        error: formatValidation.error 
      });
      return;
    }
    
    // Verificar duplicidade (async)
    setCpfValidation({ valid: false, checking: true });
    
    try {
      const duplicateCheck = await CPFValidationService.checkDuplicate(cleaned);
      
      if (!duplicateCheck.available) {
        setCpfValidation({ 
          valid: false, 
          error: 'CPF já cadastrado no sistema',
          checking: false
        });
      } else {
        setCpfValidation({ 
          valid: true,
          checking: false
        });
      }
    } catch (err) {
      setCpfValidation({ 
        valid: false, 
        error: 'Erro ao validar CPF',
        checking: false
      });
    }
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return 'Nome completo é obrigatório';
    }
    
    if (formData.fullName.trim().split(' ').length < 2) {
      return 'Informe nome e sobrenome';
    }

    if (!formData.cpf.trim()) {
      return 'CPF é obrigatório';
    }

    if (!cpfValidation.valid) {
      return cpfValidation.error || 'CPF inválido';
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
      // 1. Criar conta no Supabase Auth
      const signUpResult = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber || undefined,
      });

      if (signUpResult.error) {
        setError(getErrorMessage(signUpResult.error.message));
        return;
      }

      // 2. Verificar e salvar CPF no perfil
      if (signUpResult.user) {
        const cpfResult = await CPFValidationService.verifyCPF({
          userId: signUpResult.user.id,
          cpf: cleanCPF(formData.cpf),
          fullName: formData.fullName,
          phone: formData.phoneNumber || undefined,
        });

        if (!cpfResult.success) {
          setError(`Conta criada, mas erro ao validar CPF: ${cpfResult.message}`);
          // Não bloqueia - usuário pode atualizar depois
        }
      }

      setSuccess(true);
    } catch (err) {
      setError('Erro inesperado ao criar conta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
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

          <div className="input-with-validation">
            <Input
              type="text"
              name="cpf"
              label="CPF"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength={14}
              required
              disabled={loading}
            />
            {formData.cpf && cleanCPF(formData.cpf).length === 11 && (
              <div className={`cpf-validation-status ${cpfValidation.valid ? 'valid' : 'invalid'}`}>
                {cpfValidation.checking ? (
                  <span className="checking">🔄 Verificando...</span>
                ) : cpfValidation.valid ? (
                  <span className="valid">✓ CPF válido</span>
                ) : (
                  <span className="invalid">✗ {cpfValidation.error || 'CPF inválido'}</span>
                )}
              </div>
            )}
          </div>

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
