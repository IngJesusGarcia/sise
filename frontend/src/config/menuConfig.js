import {
  LayoutDashboard, BookOpen, Layers, Users, FileText,
  Download, FileBadge, BarChart2, GraduationCap, BookMarked,
  CreditCard, Briefcase, DollarSign, Scale, Handshake,
  ClipboardList, CalendarCheck, School, UserPlus, ArrowRightLeft, Plane,
  CalendarDays, BookCopy, Grid3x3, UserCog,
  ShoppingBag, Hash, Receipt,
  Package, ClipboardCheck, ArrowUpDown, Inbox, Send, Archive,
  Gavel, FolderOpen, FileSignature, Mail, Bell, PieChart,
  List, CornerUpLeft, History, Clock
} from 'lucide-react';

/**
 * menuConfig — Configuración maestro de módulos por rol.
 *
 * Estructura de cada "sección":
 *   { section: 'Nombre Sección', items: [ { label, path, icon, roles[] } ] }
 *
 * Si `roles` no está definido en un item, solo admin puede acceder.
 * Si el array `roles` incluye el rol del usuario, el item se muestra.
 * El admin siempre ve TODO.
 */

const ALL_ACADEMIC = ['admin', 'servicios_escolares'];
const ALL_FINANCIAL = ['admin', 'finanzas'];
const ALL_RRHH = ['admin', 'rrhh'];
const ALL_INVENTARIO = ['admin', 'inventario', 'rrhh'];
const ALL_CORRESPONDENCIA = ['admin', 'correspondencia'];
const ALL_JURIDICO = ['admin', 'juridico'];
const ALL_VINCULACION = ['admin', 'vinculacion'];
const ALL_ROLES = ['admin', 'servicios_escolares', 'rrhh', 'finanzas', 'juridico', 'vinculacion', 'docente', 'estudiante', 'inventario', 'correspondencia'];

const menuSections = [
  // ─── CONFIGURACIÓN ACADÉMICA ─────────────────────────────────
  {
    section: 'Configuración Académica',
    items: [
      { label: 'Periodos Escolares',    path: '/periodos',        icon: CalendarDays, roles: ALL_ACADEMIC },
      { label: 'Planes de Estudio',     path: '/planes-estudio',  icon: BookCopy,     roles: ALL_ACADEMIC },
    ]
  },
  // ─── ACADÉMICO ─────────────────────────────────────────────
  {
    section: 'Académico',
    items: [
      { label: 'Licenciaturas',         path: '/licenciaturas', icon: BookOpen,       roles: ALL_ACADEMIC },
      { label: 'Materias',              path: '/materias',      icon: Layers,         roles: ALL_ACADEMIC },
      { label: 'Grupos',                path: '/grupos',        icon: Users,          roles: ALL_ACADEMIC },
      { label: 'Estudiantes',           path: '/estudiantes',   icon: School,         roles: ALL_ACADEMIC },
      { label: 'Inscripciones',         path: '/inscripciones', icon: ClipboardList,  roles: ALL_ACADEMIC },
      { label: 'Calificaciones',        path: '/calificaciones',icon: FileText,       roles: [...ALL_ACADEMIC, 'docente'] },
    ]
  },
  // ─── ADMISIÓN ───────────────────────────────────────────────
  {
    section: 'Admisión de Aspirantes',
    items: [
      { label: 'Aspirantes',            path: '/aspirantes',    icon: UserPlus,       roles: ALL_ACADEMIC },
    ]
  },
  // ─── MOVIMIENTOS ACADÉMICOS ──────────────────────────────────
  {
    section: 'Control Escolar',
    items: [
      { label: 'Movimientos Académicos', path: '/movimientos-academicos', icon: ArrowRightLeft, roles: ALL_ACADEMIC },
      { label: 'Movilidad Estudiantil', path: '/movilidad',     icon: Plane,          roles: ALL_ACADEMIC },
    ]
  },
  // ─── RRHH ───────────────────────────────────────────
  {
    section: 'Recursos Humanos',
    items: [
      { label: 'Empleados',           path: '/rrhh/empleados',   icon: UserCog,       roles: ALL_RRHH },
      { label: 'Movimientos',         path: '/rrhh/movimientos', icon: ArrowRightLeft, roles: ALL_RRHH },
      { label: 'Nómina',              path: '/rrhh/nominas',     icon: DollarSign,    roles: ALL_RRHH },
      { label: 'Contratos Laborales', path: '/rrhh/contratos',   icon: FileText,      roles: ALL_RRHH },
      { label: 'Reportes de Personal',path: '/rrhh/reportes',   icon: BarChart2,     roles: ALL_RRHH },
    ]
  },
  // ─── DOCENTE ────────────────────────────────────────────────
  {
    section: 'Docente',
    items: [
      { label: 'Mis Grupos',            path: '/grupos',        icon: Users,          roles: ['docente'] },
      { label: 'Captura de Calificaciones', path: '/calificaciones', icon: FileText, roles: ['docente'] },
    ]
  },
  // ─── ESTUDIANTE ─────────────────────────────────────────────
  {
    section: 'Mi Área Escolar',
    items: [
      { label: 'Mis Materias',          path: '/inscripciones', icon: BookOpen,       roles: ['estudiante'] },
      { label: 'Mi Kardex',             path: '/kardex',        icon: ClipboardList,  roles: ['estudiante'] },
      { label: 'Mi Boleta',             path: '/boletas',       icon: Download,       roles: ['estudiante'] },
      { label: 'Mis Pagos',             path: '/pagos',         icon: CreditCard,     roles: ['estudiante'] },
    ]
  },
  // ─── DOCUMENTOS ─────────────────────────────────────────────
  {
    section: 'Documentos',
    items: [
      { label: 'Kardex Académico',      path: '/kardex',        icon: ClipboardList,  roles: ALL_ACADEMIC },
      { label: 'Boletas Oficiales',     path: '/boletas',       icon: Download,       roles: ALL_ACADEMIC },
      { label: 'Certificados y Cartas', path: '/certificados',  icon: FileBadge,      roles: ALL_ACADEMIC },
    ]
  },
  // ─── EGRESADOS Y TITULACIÓN ─────────────────────────────────
  {
    section: 'Egresados y Titulación',
    items: [
      { label: 'Padrón de Egresados',   path: '/egresados',     icon: GraduationCap, roles: ALL_ACADEMIC },
      { label: 'Proceso de Titulación', path: '/titulacion',    icon: BookMarked,     roles: ALL_ACADEMIC },
    ]
  },
  // ─── ANÁLISIS ───────────────────────────────────────────────
  {
    section: 'Análisis Institucional',
    items: [
      { label: 'Reportes y Gráficas',  path: '/reportes',       icon: BarChart2,      roles: [...ALL_ACADEMIC, 'finanzas'] },
    ]
  },
  // ─── FINANZAS ───────────────────────────────────────────────
  {
    section: 'Financiero',
    items: [
      { label: 'Catálogo de Servicios', path: '/finanzas/servicios',      icon: ShoppingBag,   roles: ALL_FINANCIAL },
      { label: 'Líneas de Captura',    path: '/finanzas/lineas-captura', icon: Hash,          roles: ALL_FINANCIAL },
      { label: 'Pagos',                path: '/finanzas/pagos',          icon: CreditCard,    roles: ALL_FINANCIAL },
      { label: 'Recibos',              path: '/finanzas/recibos',        icon: Receipt,       roles: ALL_FINANCIAL },
      { label: 'Reportes Financieros', path: '/finanzas/reportes',       icon: BarChart2,     roles: ALL_FINANCIAL },
    ]
  },
  // ─── JURÍDICO ───────────────────────────────────────────────
  {
    section: 'Área Jurídica',
    items: [
      { label: 'Abogados',                 path: '/juridico/abogados',         icon: Gavel,         roles: ALL_JURIDICO },
      { label: 'Expedientes',              path: '/juridico/expedientes',      icon: FolderOpen,    roles: ALL_JURIDICO },
      { label: 'Demandas Laborales',       path: '/juridico/demandas',         icon: Scale,         roles: ALL_JURIDICO },
      { label: 'Convenios y Contratos',    path: '/juridico/convenios',        icon: FileSignature, roles: ALL_JURIDICO },
      { label: 'Correspondencia',          path: '/juridico/correspondencia',  icon: Mail,          roles: ALL_JURIDICO },
      { label: 'Alertas y Vencimientos',   path: '/juridico/alertas',          icon: Bell,          roles: ALL_JURIDICO },
      { label: 'Reportes Jurídicos',       path: '/juridico/reportes',         icon: PieChart,      roles: ALL_JURIDICO },
    ]
  },
  // ─── VINCULACIÓN (ADMINISTRATIVO) ───────────────────────────
  {
    section: 'Vinculación',
    items: [
      { label: 'Servicio Social',        path: '/vinculacion/servicio-social', icon: Handshake,     roles: ALL_VINCULACION },
      { label: 'Repositorio Proyectos',  path: '/vinculacion/repositorio',     icon: Archive,       roles: ALL_VINCULACION },
      { label: 'Formatos Oficiales',     path: '/vinculacion/formatos',        icon: FileText,      roles: ALL_VINCULACION },
      { label: 'Reglamento',             path: '/vinculacion/reglamento',      icon: BookOpen,      roles: ALL_VINCULACION },
      { label: 'Reportes',               path: '/vinculacion/reportes',        icon: PieChart,      roles: ALL_VINCULACION },
    ],
  },
  // ─── PORTAL ESTUDIANTE ─────────────────────────────────────
    {
      section: 'Trámites',
      items: [
        { label: 'Mi Servicio Social',  path: '/servicio-social/mi-avance',  icon: GraduationCap, roles: ['estudiante'] },
        { label: 'Mis Préstamos',       path: '/mis-prestamos',               icon: Package,       roles: ['estudiante', 'docente', 'administrativo'] },
      ],
    },
  // ─── CORRESPONDENCIA ─────────────────────────────────
  {
    section: 'Correspondencia',
    items: [
      { label: 'Bandeja de Entrada',   path: '/correspondencia/documentos/entrada', icon: Inbox,       roles: ALL_ROLES },
      { label: 'Bandeja de Salida',    path: '/correspondencia/documentos/salida',  icon: Send,        roles: ALL_ROLES },
      { label: 'Todos los Oficios',    path: '/correspondencia/documentos',         icon: FileText,    roles: ALL_CORRESPONDENCIA },
      { label: 'Tipos de Documento',   path: '/correspondencia/tipos',              icon: Layers,      roles: ALL_CORRESPONDENCIA },
      { label: 'Reportes',             path: '/correspondencia/reportes',           icon: BarChart2,   roles: ALL_CORRESPONDENCIA },
    ]
  },
  // ─── RECURSOS MATERIALES (INVENTARIO) ────────────────────────────
    {
      section: 'Recursos Materiales',
      items: [
        { label: 'Inventario',             path: '/inventario',               icon: Package,         roles: ALL_INVENTARIO },
        { label: 'Solicitudes',            path: '/inventario/solicitudes',    icon: ClipboardCheck,  roles: ALL_INVENTARIO },
        { label: 'Movimientos de Almacén', path: '/inventario/movimientos',    icon: ArrowUpDown,     roles: ALL_INVENTARIO },
      ]
    },
    // ─── PRÉSTAMOS INSTITUCIONALES ─────────────────────────────────
    {
      section: 'Préstamos',
      items: [
        { label: 'Catálogo de Equipos', path: '/prestamos/equipos', icon: List, roles: ['admin', 'prestamos'] },
        { label: 'Solicitudes de Préstamo', path: '/prestamos/solicitudes', icon: ClipboardList, roles: ['admin', 'prestamos'] },
        { label: 'Préstamos Activos', path: '/prestamos/activos', icon: Clock, roles: ['admin', 'prestamos'] },
        { label: 'Devoluciones', path: '/prestamos/devoluciones', icon: CornerUpLeft, roles: ['admin', 'prestamos'] },
        { label: 'Historial', path: '/prestamos/historial', icon: History, roles: ['admin', 'prestamos'] },
        { label: 'Reportes', path: '/prestamos/reportes', icon: PieChart, roles: ['admin', 'prestamos'] },
      ]
    },
    // ─── SOLICITAR MATERIAL ─────────────────────────────────────────
  // Visible para todos los roles excepto el de inventario (que ya tiene la vista completa)
  {
    section: 'Recursos Materiales',
    items: [
      {
        label: 'Solicitar Material',
        path: '/mis-solicitudes',
        icon: Inbox,
        roles: ['servicios_escolares', 'rrhh', 'finanzas', 'juridico', 'vinculacion', 'docente', 'estudiante', 'correspondencia'],
      },
    ]
  },
  // ─── SEGURIDAD ─────────────────────────────────────────────
  {
    section: 'Seguridad',
    items: [
      { label: 'Gestión de Usuarios', path: '/usuarios', icon: UserCog, roles: ['admin'] },
    ]
  },
];

export default menuSections;
