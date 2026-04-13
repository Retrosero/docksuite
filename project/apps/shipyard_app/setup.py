from setuptools import find_packages, setup


setup(
    name="shipyard_app",
    version="0.0.1",
    description="ERPNext Shipyard Operations App",
    author="Shipyard Team",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
)
