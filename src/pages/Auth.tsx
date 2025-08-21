import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = 'Autenticação | Checklist de Limpeza';
  }, []);

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

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background lg:bg-gray-50 dark:lg:bg-gray-900">
      <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-gray-900 text-white dark:bg-gray-950">
        <img src="/imglogo.png" alt="Clean Shelf Buddy Logo" className="w-40 h-40 mb-4" />
        <h1 className="text-4xl font-bold mb-2">CheckList-CPD</h1>
        <p className="text-lg text-gray-300 text-center">
          Controle de limpeza e manutenção de equipamentos.
        </p>
      </div>
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <img src="/imglogo.png" alt="Clean Shelf Buddy Logo" className="mx-auto w-16 h-16 mb-4 lg:hidden" />
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Entre com seu e-mail e senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;