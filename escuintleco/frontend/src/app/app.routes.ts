import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'productos', loadComponent: () => import('./pages/productos/productos').then(m => m.ProductosComponent), canActivate: [authGuard] },
  { path: 'promociones', loadComponent: () => import('./pages/promociones/promociones').then(m => m.PromocionesComponent), canActivate: [authGuard] },
  { path: 'venta', loadComponent: () => import('./pages/venta/venta').then(m => m.VentaComponent), canActivate: [authGuard] },
  { path: 'factura/:id', loadComponent: () => import('./pages/factura/factura').then(m => m.FacturaComponent), canActivate: [authGuard] },
  { path: 'clientes', loadComponent: () => import('./pages/clientes/clientes').then(m => m.ClientesComponent), canActivate: [authGuard] },
  { path: 'proveedores', loadComponent: () => import('./pages/proveedores/proveedores').then(m => m.ProveedoresComponent), canActivate: [authGuard] },
  { path: 'devoluciones', loadComponent: () => import('./pages/devoluciones/devoluciones').then(m => m.DevolucionesComponent), canActivate: [authGuard] },
  { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes').then(m => m.ReportesComponent), canActivate: [authGuard] },
  { path: 'caja', loadComponent: () => import('./pages/caja/caja').then(m => m.CajaComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
