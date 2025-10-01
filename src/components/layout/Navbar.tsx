import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useCart } from '../../contexts/CartContext'

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth()
    const [navOpen, setNavOpen] = useState(false) // state for mobile menu
    const [createOpen, setCreateOpen] = useState(false) // state for create menu
    const { theme, toggleTheme } = useTheme()
    const closeClickOutside = useClickOutside(() => {
        setNavOpen(false)
        setCreateOpen(false)
    })
    const { cart } = useCart()
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    const closeAllDropdown = () => {
        setNavOpen(false)
        setCreateOpen(false)
    }
    return (
        <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4" ref={closeClickOutside}>
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse" onClick={closeAllDropdown}>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-300">
                            Cardtalogue
                        </h1>
                    </Link>
                </div>
                <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    {isAuthenticated ? (
                        <NavLink
                            to="/"
                            onClick={() => {
                                closeAllDropdown()
                                logout()
                            }}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Logout
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/login"
                            onClick={closeAllDropdown}
                            className={({ isActive }) => isActive ?
                                "hidden"
                                : "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            }
                        >
                            Login
                        </NavLink>
                    )}
                    <button data-collapse-toggle="navbar-sticky"
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-controls="navbar-sticky"
                        aria-expanded="false"
                        onClick={() => {
                            setNavOpen(!navOpen)
                            setCreateOpen(false)
                        }}
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                </div>
                <div className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${navOpen ? 'block' : 'hidden'}`}
                    id="navbar-sticky"
                >
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <NavLink to="/"
                            className={
                                ({ isActive }) => isActive
                                    ? "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                                    : "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                            }
                            aria-current="page"
                            onClick={closeAllDropdown}
                        >
                            Cards
                        </NavLink>

                        <NavLink to="/games"
                            className={({ isActive }) => isActive
                                ? "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                                : "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                            }
                            onClick={closeAllDropdown}
                        >
                            Games
                        </NavLink>

                        <NavLink to="/packs"
                            className={({ isActive }) => isActive
                                ? "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                                : "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                            }
                            onClick={closeAllDropdown}
                        >
                            Packs
                        </NavLink>

                         {isAuthenticated && (
                            <NavLink to="/storages"
                                className={({ isActive }) => isActive
                                    ? "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                                    : "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                }
                                onClick={closeAllDropdown}
                            >
                                Storages
                            </NavLink>
                        )}

                        {/* {isAuthenticated && (
                            <NavLink to="/languages"
                                className={({ isActive }) => isActive
                                    ? "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                                    : "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                }
                                onClick={closeAllDropdown}
                            >
                                Languages
                            </NavLink>
                        )} */}

                        {isAuthenticated && (
                            <li className='relative'>
                                <button onClick={() => setCreateOpen(!createOpen)} data-dropdown-toggle="dropdownNavbar" className="w-full md:w-auto text-left block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
                                    Create
                                </button>
                                <div id="dropdownNavbar" className={`w-full md:w-auto md:absolute md:top-full md:left-0 z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600 ${createOpen ? 'block' : 'hidden'}`}>
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownLargeButton">
                                        <NavLink to="/create/pack" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={closeAllDropdown}>
                                            Pack
                                        </NavLink>
                                        <NavLink to="/create/card" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={closeAllDropdown}>
                                            Card
                                        </NavLink>
                                        {/* <li aria-labelledby="dropdownNavbarLink">
                                        <button id="doubleDropdownButton" data-dropdown-toggle="doubleDropdown" data-dropdown-placement="right-start" type="button" className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dropdown<svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                                        </svg></button>
                                        <div id="doubleDropdown" className="w-full md:w-auto md:absolute md:top-0 md:left-full z-10 bg-gray-50 divide-y divide-gray-200 rounded-lg shadow-sm dark:bg-gray-600">
                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="doubleDropdownButton">
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 dark:text-gray-200 dark:hover:text-white">Overview</a>
                                                </li>
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 dark:text-gray-200 dark:hover:text-white whitespace-nowrap flex-shrink-0">My downloads</a>
                                                </li>
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 dark:text-gray-200 dark:hover:text-white">Billing</a>
                                                </li>
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 dark:text-gray-200 dark:hover:text-white">Rewards</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </li> */}
                                        {/* <li>
                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                                    </li> */}
                                    </ul>
                                    {/* <div className="py-1">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
                                </div> */}
                                </div>
                            </li>
                        )}

                        {/* {isAuthenticated && (
                            <NavLink to="/rarities"
                                className={({ isActive }) => isActive
                                    ? "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                                    : "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                }
                            >
                                Rarities
                            </NavLink>
                        )} */}

                        {/* Cart icon with badge */}
                        <NavLink onClick={closeAllDropdown} to="/cart" className="relative block py-2 px-3 text-lg text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
                            🛒
                            {cartCount > 0 && (
                                <span className="relative -top-1 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </NavLink>
                        <Link to="#"
                            onClick={toggleTheme}
                        >
                            <div className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
                                {theme === "light" ? "🌙" : "☀️"}
                            </div>
                        </Link>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
