import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = mode === 'login' ? 'Login | Checklist de Limpeza' : 'Criar conta | Checklist de Limpeza';
  }, [mode]);

  // Redireciona para a home se já estiver autenticado
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
      navigate('/');
    } catch (e: any) {
      toast({ title: 'Erro no login', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      toast({ title: 'Verifique seu e-mail', description: 'Enviamos um link de confirmação.' });
      setMode('login');
      // Limpa os campos após cadastro bem-sucedido
      setEmail('');
      setPassword('');
    } catch (e: any) {
      toast({ title: 'Erro no cadastro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'login' ? 'Entrar' : 'Criar conta'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
            </div>

            {mode === 'login' ? (
              <Button className="w-full" onClick={handleLogin} disabled={loading}>Entrar</Button>
            ) : (
              <Button className="w-full" onClick={handleSignup} disabled={loading}>Criar conta</Button>
            )}

            <div className="text-sm text-muted-foreground text-center">
              {mode === 'login' ? (
                <span>
                  Não possui conta?{' '}
                  <button className="underline" onClick={() => setMode('signup')}>Criar conta</button>
                </span>
              ) : (
                <span>
                  Já possui conta?{' '}
                  <button className="underline" onClick={() => setMode('login')}>Entrar</button>
                </span>
              )}
            </div>

            <div className="text-center">
              <Link to="/" className="underline">Voltar para o início</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
