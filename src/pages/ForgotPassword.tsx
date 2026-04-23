import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: 'Error al recuperar contraseña',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Correo enviado',
        description: 'Revisa tu email para restablecer tu contraseña.',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="text-gray-600 mt-2">Te enviaremos un enlace para restablecerla</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <Link to="/login" className="text-sm text-green-600 hover:underline font-medium block">
            Volver a iniciar sesión
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 block">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
