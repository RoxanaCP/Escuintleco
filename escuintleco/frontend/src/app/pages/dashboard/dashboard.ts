import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  usuario: any = null;
  menuAbierto = true;

  menuItems = [
    { label: 'Dashboard',       icono: 'home',      ruta: '/dashboard' },
    { label: 'Productos',       icono: 'inventory',  ruta: '/productos' },
    { label: 'Promociones',     icono: 'offers',     ruta: '/promociones' },
    { label: 'Nueva Venta',     icono: 'cart',       ruta: '/venta' },
    { label: 'Clientes',        icono: 'people',     ruta: '/clientes' },
    { label: 'Proveedores',     icono: 'truck',      ruta: '/proveedores' },
    { label: 'Devoluciones',    icono: 'return',     ruta: '/devoluciones' },
    { label: 'Reportes',        icono: 'chart',      ruta: '/reportes' },
    { label: 'Apertura/Cierre', icono: 'cash',       ruta: '/caja' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
