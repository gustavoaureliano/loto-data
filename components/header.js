import Container from './container'
import container from './container'

import styles from '../styles/header.module.css'


function Header(props) {
    return(
        <header className={styles.header}>
            <Container>
                <h1>{props.children}</h1>
            </Container>
        </header>
    )
}

export default Header;